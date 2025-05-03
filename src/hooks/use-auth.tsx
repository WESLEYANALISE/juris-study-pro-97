
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at?: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erro ao carregar o seu perfil");
        return null;
      }
      
      // Log for debugging
      console.log("Profile data fetched:", data);
      return data;
    } catch (error) {
      console.error("Exception fetching profile:", error);
      toast.error("Ocorreu um erro ao buscar seu perfil");
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData as UserProfile);
      }
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    setIsLoading(true);
    
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch user profile if logged in
        if (newSession?.user) {
          // Use setTimeout to avoid potential auth state deadlocks
          setTimeout(async () => {
            try {
              const profileData = await fetchProfile(newSession.user.id);
              setProfile(profileData as UserProfile | null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Current session:", session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if logged in
        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData as UserProfile | null);
          } catch (err) {
            console.error("Error fetching profile during init:", err);
          }
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error("Falha no login: " + error.message);
      }
      
      return { data, error };
    } catch (err) {
      console.error("Error during sign in:", err);
      toast.error("Ocorreu um erro durante o login");
      return { data: null, error: err as Error };
    } finally {
      // Loading state is handled by onAuthStateChange
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      console.log("Attempting to sign up:", email);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        toast.error("Falha no cadastro: " + error.message);
      } else {
        toast.success("Cadastro realizado com sucesso!");
      }
      
      return { data, error };
    } catch (err) {
      console.error("Error during sign up:", err);
      toast.error("Ocorreu um erro durante o cadastro");
      return { data: null, error: err as Error };
    } finally {
      // Loading state is handled by onAuthStateChange
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Erro ao fazer logout: " + error.message);
      } else {
        toast.success("Logout realizado com sucesso");
      }
      
      return { error };
    } catch (err) {
      console.error("Error during sign out:", err);
      toast.error("Ocorreu um erro durante o logout");
      return { error: err as Error };
    } finally {
      // Loading state is handled by onAuthStateChange
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
