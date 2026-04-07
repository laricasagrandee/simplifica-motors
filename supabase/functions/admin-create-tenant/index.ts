import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const body = await req.json();
    const {
      email,
      password,
      nome_responsavel,
      telefone_responsavel,
      nome_fantasia,
      cnpj,
      telefone_oficina,
      data_vencimento,
    } = body;

    if (!email || !password || !nome_responsavel || !nome_fantasia) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: email, password, nome_responsavel, nome_fantasia" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1) Create auth user
    const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createUserError) {
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createUserError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = newUser.user.id;

    // 2) Create configuracoes record — single plan, no limits
    const { data: config, error: configError } = await adminClient
      .from("configuracoes")
      .insert({
        nome_fantasia,
        cnpj: cnpj || null,
        telefone: telefone_oficina || null,
        plano: "padrao",
        plano_ativo: true,
        data_vencimento_plano: data_vencimento || new Date(Date.now() + 30 * 86400000).toISOString(),
        max_funcionarios: 999,
        dias_tolerancia: 15,
      })
      .select("id")
      .single();

    if (configError) {
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar configuração: ${configError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Create funcionarios record
    const { error: funcError } = await adminClient.from("funcionarios").insert({
      user_id: userId,
      nome: nome_responsavel,
      cargo: "admin",
      email,
      telefone: telefone_responsavel || "",
      ativo: true,
    });

    if (funcError) {
      await adminClient.from("configuracoes").delete().eq("id", config.id);
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar funcionário: ${funcError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        config_id: config.id,
        message: `Oficina "${nome_fantasia}" criada com sucesso!`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
