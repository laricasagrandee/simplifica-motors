import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Usuário não autenticado");
    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Buscar tenant
    const { data: func } = await supabase
      .from("funcionarios")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();
    if (!func?.tenant_id) throw new Error("Funcionário não encontrado");

    // Buscar config
    const { data: config } = await supabase
      .from("configuracoes")
      .select("stripe_customer_id, stripe_subscription_id, plano, data_vencimento_plano")
      .eq("id", func.tenant_id)
      .single();

    if (!config?.stripe_customer_id) {
      logStep("No Stripe customer, returning unsubscribed");
      return new Response(JSON.stringify({ subscribed: false, plano: config?.plano || "teste" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verificar assinatura ativa
    const subscriptions = await stripe.subscriptions.list({
      customer: config.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    const hasActive = subscriptions.data.length > 0;
    let subscriptionEnd: string | null = null;
    let slug: string | null = null;

    if (hasActive) {
      const sub = subscriptions.data[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      slug = (sub.metadata?.slug as string) || null;
      logStep("Active subscription found", { id: sub.id, slug, end: subscriptionEnd });

      // Atualizar banco com dados atualizados
      await supabase.from("configuracoes").update({
        plano: slug || config.plano,
        plano_ativo: true,
        data_vencimento_plano: subscriptionEnd,
        stripe_subscription_id: sub.id,
      }).eq("id", func.tenant_id);
    } else {
      logStep("No active subscription");
      // Se tinha assinatura antes e agora não tem mais, marcar como expirado
      if (config.stripe_subscription_id) {
        await supabase.from("configuracoes").update({
          stripe_subscription_id: null,
        }).eq("id", func.tenant_id);
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActive,
      plano: slug || config.plano,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
