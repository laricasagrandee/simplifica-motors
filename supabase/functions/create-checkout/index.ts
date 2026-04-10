import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Usuário não autenticado");
    const user = userData.user;

    // Buscar tenant_id do funcionário
    const { data: func } = await supabase
      .from("funcionarios")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();
    if (!func?.tenant_id) throw new Error("Funcionário não encontrado");

    // Ler body
    const body = await req.json();
    const { slug, intervalo } = body;
    if (!slug || !intervalo) throw new Error("slug e intervalo são obrigatórios");
    if (!["basico", "profissional", "premium"].includes(slug)) throw new Error("Plano inválido");
    if (!["mensal", "anual"].includes(intervalo)) throw new Error("Intervalo inválido");

    // Buscar preço do plano usando service role para ler plano_precos
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: plano, error: planoError } = await adminClient
      .from("plano_precos")
      .select("stripe_price_id, valor_centavos")
      .eq("slug", slug)
      .eq("intervalo", intervalo)
      .eq("ativo", true)
      .single();

    if (planoError || !plano) throw new Error("Plano não encontrado ou inativo");
    if (!plano.stripe_price_id) throw new Error("Preço do Stripe não configurado para este plano. Contate o administrador.");

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Buscar ou criar customer no Stripe
    const { data: config } = await adminClient
      .from("configuracoes")
      .select("stripe_customer_id, nome_fantasia")
      .eq("id", func.tenant_id)
      .single();

    let customerId = config?.stripe_customer_id;

    if (!customerId) {
      // Buscar por email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: config?.nome_fantasia || user.email,
          metadata: { tenant_id: func.tenant_id },
        });
        customerId = customer.id;
      }
      // Salvar no banco
      await adminClient
        .from("configuracoes")
        .update({ stripe_customer_id: customerId })
        .eq("id", func.tenant_id);
    }

    // Criar sessão de checkout
    const origin = req.headers.get("origin") || "https://id-preview--99650e58-d89f-4f99-ba75-3ab0dc90173e.lovable.app";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: plano.stripe_price_id, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?pagamento=sucesso`,
      cancel_url: `${origin}/planos?pagamento=cancelado`,
      metadata: { tenant_id: func.tenant_id, slug, intervalo },
      subscription_data: {
        metadata: { tenant_id: func.tenant_id, slug, intervalo },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
