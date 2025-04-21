
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

/**
 * Componente para proteger rotas que requerem autenticação.
 * Redireciona para /auth se não estiver autenticado.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Configure o listener de auth ANTES de buscar sessão atual.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setChecked(true);

      // Se não autenticado, redireciona para /auth
      if (!session?.user && location.pathname !== "/auth") {
        navigate("/auth", { replace: true });
      }
      // Se autenticado E está na página de login, manda para a home
      if (session?.user && location.pathname === "/auth") {
        navigate("/", { replace: true });
      }
    });

    // Checa sessão existente ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
      setChecked(true);

      // Redireciona se não autenticado
      if (!session?.user && location.pathname !== "/auth") {
        navigate("/auth", { replace: true });
      }
      if (session?.user && location.pathname === "/auth") {
        navigate("/", { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  // Evita flicker: só renderiza filhos depois que o estado for checado
  if (!checked) return null;
  // Se está autenticado ou está na tela de login, mostra os filhos
  if (loggedIn || location.pathname === "/auth") return <>{children}</>;

  // No resto, não renderiza nada enquanto redireciona
  return null;
}
