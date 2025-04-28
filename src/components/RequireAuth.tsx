
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Componente para proteger rotas que requerem autenticação.
 * Redireciona para /auth se não estiver autenticado.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("RequireAuth: Setting up auth check");
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    // Configure o listener de auth ANTES de buscar sessão atual.
    const setupAuthListener = () => {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        console.log("Auth state changed in RequireAuth:", _event, newSession?.user?.email);
        setSession(newSession);
        setChecked(true);

        // Se não autenticado, redireciona para /auth
        if (!newSession && location.pathname !== "/auth") {
          console.log("Not authenticated, redirecting to /auth");
          toast.error("Você precisa estar logado para acessar esta página");
          navigate("/auth", { replace: true });
        }
        // Se autenticado E está na página de login, manda para a home
        if (newSession && location.pathname === "/auth") {
          console.log("Already authenticated, redirecting to home");
          navigate("/", { replace: true });
        }
      });
      
      return listener;
    };

    // Checa sessão existente ao carregar
    const checkCurrentSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Current session in RequireAuth:", currentSession?.user?.email);
        setSession(currentSession);
        setChecked(true);

        // Redireciona se não autenticado
        if (!currentSession && location.pathname !== "/auth") {
          console.log("No session found, redirecting to /auth");
          toast.error("Você precisa estar logado para acessar esta página");
          navigate("/auth", { replace: true });
        }
        if (currentSession && location.pathname === "/auth") {
          console.log("Session found on auth page, redirecting to home");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setChecked(true);
      }
    };

    // Setup auth listener first
    authListener = setupAuthListener();
    // Then check current session
    checkCurrentSession();

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  // Evita flicker: só renderiza filhos depois que o estado for checado
  if (!checked) return null;
  
  // Se está autenticado ou está na tela de login, mostra os filhos
  if (session || location.pathname === "/auth") return <>{children}</>;

  // No resto, não renderiza nada enquanto redireciona
  return null;
}
