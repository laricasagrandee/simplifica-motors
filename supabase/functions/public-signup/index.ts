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
    const { email, password, nome, fingerprint, device_type } = body;

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
    const cleanFingerprint = typeof fingerprint === "string" ? fingerprint.slice(0, 128) : null;
    const cleanDeviceType = typeof device_type === "string" ? device_type.slice(0, 20) : "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ─── Trial abuse checks ──────────────────────────────────
    // Check if email already used a trial
    const { data: emailTrials } = await adminClient
      .from("device_fingerprints")
      .select("id, tenant_id")
      .eq("email", cleanEmail)
      .not("trial_started_at", "is", null)
      .limit(1);

    if (emailTrials && emailTrials.length > 0) {
      // Check if the tenant still exists (user might have been deleted by admin)
      const trialRecord = emailTrials[0];
      let tenantStillExists = false;
      if (trialRecord.tenant_id) {
        const { data: tenant } = await adminClient
          .from("configuracoes")
          .select("id")
          .eq("id", trialRecord.tenant_id)
          .maybeSingle();
        tenantStillExists = !!tenant;
      }
      // Also check if the auth user still exists for this email
      const { data: existingUsers } = await adminClient.auth.admin.listUsers({ perPage: 1 });
      const userStillExists = existingUsers?.users?.some(
        (u: { email?: string }) => u.email?.toLowerCase() === cleanEmail,
      );

      if (tenantStillExists || userStillExists) {
        return new Response(
          JSON.stringify({ error: "Este e-mail já utilizou o período de teste gratuito." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Orphaned record — clean it up so the user can re-register
      await adminClient.from("device_fingerprints").delete().eq("id", trialRecord.id);
    }

    // Check if device fingerprint already used a trial
    if (cleanFingerprint) {
      const { data: fpTrials } = await adminClient
        .from("device_fingerprints")
        .select("id, tenant_id")
        .eq("fingerprint", cleanFingerprint)
        .not("trial_started_at", "is", null)
        .limit(1);

      if (fpTrials && fpTrials.length > 0) {
        const fpRecord = fpTrials[0];
        let fpTenantExists = false;
        if (fpRecord.tenant_id) {
          const { data: tenant } = await adminClient
            .from("configuracoes")
            .select("id")
            .eq("id", fpRecord.tenant_id)
            .maybeSingle();
          fpTenantExists = !!tenant;
        }
        if (fpTenantExists) {
          return new Response(
            JSON.stringify({ error: "Este dispositivo já utilizou o período de teste gratuito." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        // Orphaned — clean up
        await adminClient.from("device_fingerprints").delete().eq("id", fpRecord.id);
      }
    }

    // ─── Create user ──────────────────────────────────────────
    const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: false,
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

    // ─── Create tenant with 30-day trial ──────────────────────
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 86400000);
    const vencimento = trialEnd.toISOString();

    const { data: config, error: configError } = await adminClient
      .from("configuracoes")
      .insert({
        nome_fantasia: `Oficina de ${cleanNome}`,
        plano: "teste",
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

    // ─── Create funcionario record ────────────────────────────
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

    // ─── Register device fingerprint ──────────────────────────
    if (cleanFingerprint) {
      await adminClient.from("device_fingerprints").insert({
        fingerprint: cleanFingerprint,
        device_type: cleanDeviceType,
        email: cleanEmail,
        tenant_id: config.id,
        trial_started_at: now.toISOString(),
        trial_ends_at: vencimento,
      });
    }

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
