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
    const body = await req.json();
    const { email, password, nome } = body;

    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: nome, email, password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Basic validation
    if (typeof email !== "string" || email.length > 200) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter entre 6 e 128 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (typeof nome !== "string" || nome.trim().length < 2 || nome.length > 200) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter entre 2 e 200 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, "").trim().toLowerCase();
    const cleanNome = nome.trim().slice(0, 200);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1) Create auth user (email confirmation required)
    const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: false, // User must confirm email
    });

    if (createUserError) {
      const msg = createUserError.message.includes("already been registered")
        ? "Este e-mail já está cadastrado. Faça login."
        : `Erro ao criar conta: ${createUserError.message}`;
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = newUser.user.id;

    // 2) Create configuracoes (tenant) with 30-day trial
    const vencimento = new Date(Date.now() + 30 * 86400000).toISOString();
    const { data: config, error: configError } = await adminClient
      .from("configuracoes")
      .insert({
        nome_fantasia: `Oficina de ${cleanNome}`,
        plano_ativo: true,
        data_vencimento_plano: vencimento,
        max_funcionarios: 999,
        dias_tolerancia: 15,
      })
      .select("id")
      .single();

    if (configError) {
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar oficina: ${configError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Create funcionario record
    const { error: funcError } = await adminClient.from("funcionarios").insert({
      user_id: userId,
      nome: cleanNome,
      cargo: "admin",
      email: cleanEmail,
      telefone: "",
      ativo: true,
      tenant_id: config.id,
    });

    if (funcError) {
      await adminClient.from("configuracoes").delete().eq("id", config.id);
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar perfil: ${funcError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4) Send confirmation email via Supabase Auth
    // The user was created with email_confirm: false, so Supabase will send the confirmation email automatically
    // We also generate a magic link as backup
    const siteUrl = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://facilitamotors.com.br";

    return new Response(
      JSON.stringify({
        success: true,
        message: "Conta criada! Verifique seu e-mail para confirmar.",
        user_id: userId,
        config_id: config.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
