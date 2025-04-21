
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthResult } from "./authService";

// Gerenciamento de sessão e atualizações de tokens
export const sessionService = {
  // Verificar se a sessão é válida
  isSessionValid: (session: Session | null): boolean => {
    if (!session) return false;
    
    // Verificar expiração do token
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at ? session.expires_at > now : false;
  },
  
  // Renovar sessão se necessário
  refreshSession: async (): Promise<AuthResult<Session>> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      return {
        data: data.session,
        error: null,
        success: !!data.session
      };
    } catch (err: any) {
      console.error("Erro ao renovar sessão:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao renovar sessão",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },
  
  // Armazenar sessão no localStorage
  storeSession: (session: Session | null): void => {
    if (!session) {
      localStorage.removeItem("supabase_session");
      return;
    }
    
    try {
      localStorage.setItem("supabase_session", JSON.stringify(session));
    } catch (error) {
      console.error("Erro ao armazenar sessão:", error);
    }
  },
  
  // Recuperar sessão do localStorage
  getStoredSession: (): Session | null => {
    try {
      const sessionStr = localStorage.getItem("supabase_session");
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
      console.error("Erro ao recuperar sessão:", error);
      return null;
    }
  },
  
  // Limpar sessão armazenada
  clearStoredSession: (): void => {
    try {
      localStorage.removeItem("supabase_session");
    } catch (error) {
      console.error("Erro ao limpar sessão:", error);
    }
  }
};
