import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PLANOS_VALIDOS = ["basico", "profissional", "premium", "vitalicia", "enterprise"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: func, error: funcErr } = await adminClient
      .from("funcionarios")
      .select("cargo")
      .eq("user_id", userId)
      .single();

    if (funcErr || func?.cargo !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas admin." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { config_id, plano, plano_ativo, data_vencimento_plano, max_funcionarios } = body;

    if (!config_id) {
      return new Response(JSON.stringify({ error: "config_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = {};
    if (plano !== undefined) {
      if (!PLANOS_VALIDOS.includes(plano)) {
        return new Response(JSON.stringify({ error: "Plano inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      updates.plano = plano;
    }
    if (plano_ativo !== undefined) updates.plano_ativo = Boolean(plano_ativo);
    if (data_vencimento_plano !== undefined) updates.data_vencimento_plano = data_vencimento_plano;
    if (max_funcionarios !== undefined) updates.max_funcionarios = Number(max_funcionarios);

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum campo para atualizar" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await adminClient
      .from("configuracoes")
      .update(updates)
      .eq("id", config_id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Licença atualizada com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
