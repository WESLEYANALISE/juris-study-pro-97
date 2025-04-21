
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Definir listener ANTES de buscar sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed", session?.user?.email);
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
    });

    // Buscar sessão atual no início
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check", session?.user?.email);
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error during sign in:", err);
      setState((s) => ({ 
        ...s, 
        loading: false, 
        error: err instanceof Error ? err.message : "Ocorreu um erro inesperado" 
      }));
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error("Sign up error:", error.message);
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error during sign up:", err);
      setState((s) => ({ 
        ...s, 
        loading: false, 
        error: err instanceof Error ? err.message : "Ocorreu um erro inesperado" 
      }));
      return false;
    }
  };

  const signOut = async () => {
    setState((s) => ({ ...s, loading: true }));
    
    try {
      await supabase.auth.signOut();
      setState({ user: null, session: null, loading: false, error: null });
    } catch (err) {
      console.error("Error during sign out:", err);
      setState((s) => ({ 
        ...s, 
        loading: false, 
        error: err instanceof Error ? err.message : "Ocorreu um erro ao sair" 
      }));
    }
  };

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
  };
}
