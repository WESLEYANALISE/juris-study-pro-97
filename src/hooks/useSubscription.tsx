
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface SubscriptionInfo {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<string | null>;
  goToCustomerPortal: () => Promise<string | null>;
  isCheckingOut: boolean;
  isRedirecting: boolean;
}

const defaultSubscriptionInfo: SubscriptionInfo = {
  subscribed: false,
  subscriptionTier: null,
  subscriptionEnd: null,
  isLoading: true,
  checkSubscription: async () => {},
  createCheckout: async () => null,
  goToCustomerPortal: async () => null,
  isCheckingOut: false,
  isRedirecting: false,
};

const SubscriptionContext = createContext<SubscriptionInfo>(defaultSubscriptionInfo);

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Verificar status da assinatura
  const checkSubscription = async () => {
    if (!user || !session?.access_token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Verificando status da assinatura para usuário:", user.email);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Status de assinatura recebido:", data);
        setSubscribed(data.subscribed || false);
        setSubscriptionTier(data.subscription_tier || null);
        setSubscriptionEnd(data.subscription_end ? new Date(data.subscription_end) : null);
      } else {
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      toast.error("Erro ao verificar status da assinatura");
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar checkout do Stripe
  const createCheckout = async (): Promise<string | null> => {
    if (!user || !session?.access_token) {
      toast.error("Você precisa estar logado para realizar uma assinatura");
      return null;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId: "price_1RJjxxIIaptXZgSJdhUIUi5W" },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não retornada");

      return data.url;
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      toast.error("Erro ao iniciar checkout de assinatura");
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Acessar portal de cliente do Stripe para gerenciar assinatura
  const goToCustomerPortal = async (): Promise<string | null> => {
    if (!user || !session?.access_token) {
      toast.error("Você precisa estar logado para gerenciar sua assinatura");
      return null;
    }

    setIsRedirecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("URL do portal não retornada");

      return data.url;
    } catch (error) {
      console.error("Erro ao acessar portal do cliente:", error);
      toast.error("Erro ao acessar gerenciamento de assinatura");
      return null;
    } finally {
      setIsRedirecting(false);
    }
  };

  // Verificar assinatura quando usuário mudar ou componente carregar
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setIsLoading(false);
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    }
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        subscriptionTier,
        subscriptionEnd,
        isLoading,
        checkSubscription,
        createCheckout,
        goToCustomerPortal,
        isCheckingOut,
        isRedirecting,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
