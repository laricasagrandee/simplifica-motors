import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await anonClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MASTER_EMAIL = "smartinfoconserta@gmail.com";
    if (caller.email !== MASTER_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { config_id } = await req.json();
    if (!config_id) {
      return new Response(
        JSON.stringify({ error: "config_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get auth user_ids linked to this tenant to delete them later
    const { data: funcs } = await adminClient
      .from("funcionarios")
      .select("user_id")
      .eq("tenant_id", config_id)
      .not("user_id", "is", null);

    const userIds = (funcs || []).map((f: any) => f.user_id).filter(Boolean);

    // Delete linked data in order (child tables first)
    const tables = [
      "itens_os", "pagamentos_os", "checklist_os", "fotos_os", "tempo_servico",
      "itens_nf", "notas_fiscais",
      "itens_venda_pdv", "vendas_pdv", "caixa_diario",
      "agendamentos",
      "ordens_servico", "veiculos", "motos", "clientes",
      "movimentacoes", "pecas", "categorias_pecas",
      "metas_funcionario", "comissoes",
      "inventarios", "audit_log",
      "funcionarios",
    ];

    for (const table of tables) {
      const { error: tableErr } = await adminClient.from(table).delete().eq("tenant_id", config_id);
      if (tableErr) {
        console.warn(`Aviso: falha ao limpar ${table}: ${tableErr.message}`);
      }
    }

    // Delete configuracao
    const { error: delError } = await adminClient
      .from("configuracoes")
      .delete()
      .eq("id", config_id);

    if (delError) {
      return new Response(
        JSON.stringify({ error: `Erro ao excluir configuração: ${delError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete auth users
    for (const uid of userIds) {
      try {
        const { error: delUserErr } = await adminClient.auth.admin.deleteUser(uid);
        if (delUserErr) {
          console.warn(`Aviso: falha ao excluir auth user ${uid}: ${delUserErr.message}`);
        }
      } catch (e) {
        console.warn(`Aviso: exceção ao excluir auth user ${uid}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Oficina excluída com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
