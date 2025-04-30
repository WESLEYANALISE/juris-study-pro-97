
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanCard } from "@/components/subscription/PlanCard";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowLeft, RefreshCw, ExternalLink, CheckCircle } from "lucide-react";

// Features para o plano gratuito
const freeFeatures = [
  { name: "Acesso a conteúdo básico", available: true },
  { name: "Visualização de leis e códigos", available: true },
  { name: "Podcasts gratuitos", available: true },
  { name: "Resumos de disciplinas", available: true },
  { name: "Acesso limitado a simulados", available: false },
  { name: "Biblioteca completa", available: false },
  { name: "Conteúdo premium", available: false },
];

// Features para o plano premium
const premiumFeatures = [
  { name: "Acesso a conteúdo básico", available: true },
  { name: "Visualização de leis e códigos", available: true },
  { name: "Podcasts gratuitos", available: true },
  { name: "Resumos de disciplinas", available: true },
  { name: "Acesso a todos os simulados", available: true },
  { name: "Biblioteca jurídica completa", available: true },
  { name: "Conteúdo premium exclusivo", available: true },
];

export default function Assinatura() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscription,
    createCheckout,
    goToCustomerPortal,
    isCheckingOut,
    isRedirecting
  } = useSubscription();

  const [refreshing, setRefreshing] = useState(false);

  // Verificar se usuário está autenticado
  useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar logado para acessar esta página");
      navigate("/auth");
    }
  }, [user, navigate]);

  // Verificar status da assinatura na montagem e periodicamente
  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        await checkSubscription();
      }
    };

    checkStatus();

    // Verificar status a cada 10 segundos se estiver na página de assinatura
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Função para refresh manual do status
  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast.success("Status de assinatura atualizado");
  };

  // Função para checkout
  const handleSubscribe = async () => {
    const checkoutUrl = await createCheckout();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  // Função para acessar portal de gerenciamento
  const handleManageSubscription = async () => {
    const portalUrl = await goToCustomerPortal();
    if (portalUrl) {
      window.location.href = portalUrl;
    }
  };

  // Formato para exibir data de término da assinatura
  const formatSubscriptionEnd = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <Helmet>
        <title>Assinatura | Direito 360</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hidden md:flex"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold">Planos de assinatura</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing || isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar status
          </Button>
        </div>

        {/* Status da assinatura atual */}
        {user && (
          <div className="mb-10 rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Scale className="h-7 w-7 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Status da assinatura</h2>
                  <p className="text-sm text-muted-foreground">
                    Informações sobre sua assinatura atual
                  </p>
                </div>
              </div>
              
              {isLoading ? (
                <Badge variant="secondary">Verificando...</Badge>
              ) : subscribed ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" /> Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">Nenhuma assinatura</Badge>
              )}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Plano</h3>
                <p className="mt-1 font-medium">
                  {subscribed ? subscriptionTier : "Gratuito"}
                </p>
              </div>
              
              {subscribed && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Renovação</h3>
                  <p className="mt-1 font-medium">{formatSubscriptionEnd(subscriptionEnd)}</p>
                </div>
              )}
              
              <div className="sm:col-span-2 md:col-span-1">
                {subscribed ? (
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription} 
                    disabled={isRedirecting}
                    className="mt-2 w-full sm:mt-0"
                  >
                    {isRedirecting ? "Redirecionando..." : "Gerenciar assinatura"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubscribe} 
                    disabled={isCheckingOut} 
                    className="mt-2 w-full sm:mt-0"
                  >
                    {isCheckingOut ? "Redirecionando..." : "Assinar agora"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cartões de planos */}
        <div className="grid gap-6 sm:grid-cols-2">
          <PlanCard
            title="Plano Gratuito"
            description="Acesso básico ao Direito 360"
            price="R$ 0"
            features={freeFeatures}
            current={!subscribed}
            onSubscribe={() => {}}
            disabled={true}
          />
          
          <PlanCard
            title="Plano Premium"
            description="Acesso completo a todos os recursos"
            price="R$ 15,99"
            features={premiumFeatures}
            current={subscribed && subscriptionTier === "Premium"}
            onSubscribe={handleSubscribe}
            isLoading={isCheckingOut}
            recommended={true}
          />
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Como funciona a cobrança?</h3>
              <p className="mt-1 text-muted-foreground">
                A assinatura é renovada automaticamente todos os meses. Você pode cancelar a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Posso cancelar a assinatura?</h3>
              <p className="mt-1 text-muted-foreground">
                Sim, você pode cancelar sua assinatura a qualquer momento através do seu painel de gerenciamento, sem multas.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">O que está incluso no plano Premium?</h3>
              <p className="mt-1 text-muted-foreground">
                O plano Premium inclui acesso completo a todos os recursos da plataforma Direito 360, incluindo simulados completos, biblioteca jurídica, conteúdo premium e muito mais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </JuridicalBackground>
  );
}
