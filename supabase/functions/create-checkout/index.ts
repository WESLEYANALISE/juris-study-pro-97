
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para logs detalhados
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Função iniciada");
    
    // Obter o STRIPE_SECRET_KEY do ambiente
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Chave do Stripe verificada");

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Credenciais do Supabase não configuradas");

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    logStep("Cliente Supabase criado");

    // Autenticar usuário a partir do token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Cabeçalho de autorização não fornecido");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    // Verificar se body é JSON
    const requestData = await req.json().catch(() => ({}));
    const priceId = requestData.priceId || "price_1RJjxxIIaptXZgSJdhUIUi5W"; // Use preço padrão se não for fornecido
    logStep("Usando priceId", { priceId });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar se o usuário já é um cliente no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Cliente existente encontrado", { customerId });
    } else {
      logStep("Nenhum cliente existente encontrado, será criado durante checkout");
    }

    // Obter URL de origem para redirecionamentos
    const origin = req.headers.get("origin") || "http://localhost:8080";
    
    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/assinatura/sucesso`,
      cancel_url: `${origin}/assinatura/cancelado`,
      allow_promotion_codes: true,
    });
    
    logStep("Sessão de checkout criada", { sessionId: session.id, url: session.url });

    // Retornar URL da sessão de checkout
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
