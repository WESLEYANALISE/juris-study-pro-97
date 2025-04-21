
import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService, AuthError } from "@/services/auth/authService";
import { sessionService } from "@/services/auth/sessionService";
import { userService, UserProfile, UserState } from "@/services/auth/userService";
import { toast } from "@/components/ui/use-toast";

// Tipo que define o estado completo de autenticação
interface AuthContextType {
  // Estado atual
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  userState: UserState;
  
  // Métodos de autenticação
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithOtp: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signupWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

// Valores padrão para o contexto
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  userState: {
    isAdmin: false,
    isEmailVerified: false,
    isNewUser: false,
    profile: null
  },
  
  loginWithEmail: async () => false,
  loginWithOtp: async () => false,
  loginWithGoogle: async () => false,
  signupWithEmail: async () => false,
  logout: async () => false,
  resetPassword: async () => false,
  updatePassword: async () => false
};

// Criação do contexto
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Hook para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provider para envolver a aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estado principal da autenticação
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  // Determinar se o usuário está autenticado
  const isAuthenticated = useMemo(() => {
    return !!session && !!user;
  }, [session, user]);
  
  // Determinar estado do usuário
  const userState = useMemo<UserState>(() => {
    return {
      isAdmin: profile?.user_type === 'admin',
      isEmailVerified: user ? userService.isEmailVerified(user) : false,
      isNewUser: userService.isNewUser(profile, user),
      profile
    };
  }, [user, profile]);
  
  // Inicializar a autenticação
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Definir listener para mudanças de estado de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            // Buscar perfil do usuário
            const { data: userProfile } = await userService.getUserProfile(currentSession.user.id);
            setProfile(userProfile);
            
            // Verificar se é o primeiro usuário e promover para admin se necessário
            await userService.promoteFirstUserToAdmin(currentSession.user.id);
          } else {
            setProfile(null);
          }
        }
      );
      
      // Verificar se já existe uma sessão
      const { data: currentSession } = await authService.getSession();
      
      // Somente atualizar o estado se não foi atualizado pelo listener
      if (currentSession && currentSession.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Buscar perfil do usuário
        const { data: userProfile } = await userService.getUserProfile(currentSession.user.id);
        setProfile(userProfile);
      }
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error("Erro ao inicializar autenticação:", err);
      setError({
        message: "Falha ao inicializar autenticação"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Inicializar autenticação ao montar o componente
  useEffect(() => {
    const cleanup = initializeAuth();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [initializeAuth]);
  
  // Implementação do login com email
  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.loginWithEmail(email, password);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro no login",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (result.data) {
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!"
        });
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido no login";
      setError({ message: errorMsg });
      toast({
        title: "Erro no login",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login com OTP (magic link)
  const loginWithOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.loginWithOtp(email);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro ao enviar link",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Link enviado",
        description: "Verifique seu email para fazer login"
      });
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao enviar link de acesso";
      setError({ message: errorMsg });
      toast({
        title: "Erro ao enviar link",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login com Google
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.loginWithGoogle();
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro no login com Google",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      // Não mostramos toast aqui pois o usuário será redirecionado
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro no login com Google";
      setError({ message: errorMsg });
      toast({
        title: "Erro no login com Google",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cadastro com email
  const signupWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signupWithEmail(email, password);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro no cadastro",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o cadastro"
      });
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao criar conta";
      setError({ message: errorMsg });
      toast({
        title: "Erro no cadastro",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout
  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.logout();
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro ao sair",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      // Limpar estado
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você saiu com sucesso"
      });
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer logout";
      setError({ message: errorMsg });
      toast({
        title: "Erro ao sair",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Redefinição de senha
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro na redefinição",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha"
      });
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao solicitar redefinição de senha";
      setError({ message: errorMsg });
      toast({
        title: "Erro na redefinição",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar senha
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.updatePassword(newPassword);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Erro ao atualizar senha",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso"
      });
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao atualizar senha";
      setError({ message: errorMsg });
      toast({
        title: "Erro ao atualizar senha",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Criar o valor do contexto
  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    error,
    userState,
    
    loginWithEmail,
    loginWithOtp,
    loginWithGoogle,
    signupWithEmail,
    logout,
    resetPassword,
    updatePassword
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
