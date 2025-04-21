
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

export type AuthError = {
  message: string;
  code?: string;
  status?: number;
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
};

// Tipo de retorno padronizado para operações de autenticação
export type AuthResult<T = void> = {
  data: T | null;
  error: AuthError | null;
  success: boolean;
};

export const authService = {
  // Inicializa e obtém a sessão atual
  getSession: async (): Promise<AuthResult<Session>> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return {
        data: data.session,
        error: null,
        success: !!data.session
      };
    } catch (err: any) {
      console.error("Erro ao obter sessão:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao verificar sessão",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Login com email e senha
  loginWithEmail: async (email: string, password: string): Promise<AuthResult<Session>> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return {
        data: data.session,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro no login:", err);
      
      let message = "Falha ao realizar login";
      
      if (err.message?.includes("Invalid login credentials")) {
        message = "Credenciais inválidas. Verifique seu email e senha.";
      } else if (err.message?.includes("Email not confirmed")) {
        message = "Email não confirmado. Verifique sua caixa de entrada.";
      }
      
      return {
        data: null,
        error: {
          message,
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Login com OTP (One-Time Password)
  loginWithOtp: async (email: string): Promise<AuthResult<void>> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro ao enviar OTP:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao enviar o link mágico",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Login com Google
  loginWithGoogle: async (): Promise<AuthResult<void>> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao realizar login com Google",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Cadastro com email e senha
  signupWithEmail: async (email: string, password: string): Promise<AuthResult<User>> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      return {
        data: data.user,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      
      let message = "Falha ao realizar cadastro";
      
      if (err.message?.includes("User already registered")) {
        message = "Este email já está cadastrado. Tente fazer login.";
      }
      
      return {
        data: null,
        error: {
          message,
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Logout
  logout: async (): Promise<AuthResult<void>> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro no logout:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao realizar logout",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Redefinição de senha
  resetPassword: async (email: string): Promise<AuthResult<void>> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro ao enviar redefinição de senha:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao enviar redefinição de senha",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },

  // Atualização de senha
  updatePassword: async (newPassword: string): Promise<AuthResult<void>> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro ao atualizar senha:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao atualizar senha",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  }
};
