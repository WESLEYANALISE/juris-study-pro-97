
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

/**
 * Componente para proteger rotas que requerem autenticação.
 * Redireciona para /auth se não estiver autenticado.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine which routes require authentication
  const requiresAuth = (path: string) => {
    // List of routes that require authentication
    const protectedRoutes = [
      "/questoes",
      "/simulados",
      "/flashcards",
      "/assistente", 
      "/perfil",
      "/curso",
      "/anotacoes"
    ];
    
    // Check if the current path matches any protected route prefix
    return protectedRoutes.some(route => 
      path === route || 
      path.startsWith(`${route}/`)
    );
  };

  useEffect(() => {
    console.log("RequireAuth: Setting up auth check");
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    const checkCurrentSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setChecked(true);
          setIsInitializing(false);
          return;
        }
        
        console.log("Current session in RequireAuth:", currentSession?.user?.email);
        setSession(currentSession);
        setChecked(true);

        // Redireciona se não autenticado e está numa página protegida
        if (!currentSession && location.pathname !== "/auth" && requiresAuth(location.pathname)) {
          console.log("No session found, redirecting to /auth");
          toast.error("Você precisa estar logado para acessar esta página");
          navigate("/auth", { 
            replace: true, 
            state: { from: location.pathname } 
          });
        }
        if (currentSession && location.pathname === "/auth") {
          console.log("Session found on auth page, redirecting to home");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Configure o listener de auth
    const setupAuthListener = () => {
      const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log("Auth state changed in RequireAuth:", event, newSession?.user?.email);
        
        // Evite atualizações de estado durante o desmonte do componente
        setSession(newSession);
        setChecked(true);

        if (event === "SIGNED_OUT") {
          // Se deslogou e está numa página protegida, redireciona
          if (location.pathname !== "/auth" && requiresAuth(location.pathname)) {
            navigate("/auth", { replace: true });
          }
        } else if (event === "SIGNED_IN") {
          // Se logou e está na página de auth, redireciona para a home
          if (location.pathname === "/auth") {
            navigate("/", { replace: true });
          }
        }
      });
      
      return listener;
    };
    
    // Setup auth listener first
    authListener = setupAuthListener();
    // Then check current session
    checkCurrentSession();

    return () => {
      if (authListener && authListener.subscription) {
        console.log("Unsubscribing from auth listener");
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  // Mostrar indicador de carregamento durante a inicialização
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  // Evita flicker: só renderiza filhos depois que o estado for checado
  if (!checked) return null;
  
  // Render children after authentication check is complete
  return <>{children}</>;
}
