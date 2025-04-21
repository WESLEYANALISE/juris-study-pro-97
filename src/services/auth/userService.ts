
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthResult } from "./authService";

export type UserProfile = {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  user_type?: string;
  created_at?: string;
  updated_at?: string;
};

// Tipo para uso na aplicação
export type UserState = {
  isAdmin: boolean;
  isEmailVerified: boolean;
  isNewUser: boolean;
  profile: UserProfile | null;
};

// Serviço para gerenciamento de usuários
export const userService = {
  // Recuperar perfil do usuário do banco de dados
  getUserProfile: async (userId: string): Promise<AuthResult<UserProfile>> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      return {
        data: data as UserProfile,
        error: null,
        success: !!data
      };
    } catch (err: any) {
      console.error("Erro ao recuperar perfil:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao recuperar perfil",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },
  
  // Atualizar perfil do usuário
  updateUserProfile: async (userId: string, profile: Partial<UserProfile>): Promise<AuthResult<UserProfile>> => {
    try {
      const updateData = {
        ...profile,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        data: data as UserProfile,
        error: null,
        success: true
      };
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      return {
        data: null,
        error: {
          message: err.message || "Falha ao atualizar perfil",
          code: err.code,
          status: err.status
        },
        success: false
      };
    }
  },
  
  // Verificar se usuário é admin
  checkIfUserIsAdmin: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data?.user_type === 'admin';
    } catch (err) {
      console.error("Erro ao verificar se usuário é admin:", err);
      return false;
    }
  },
  
  // Verificar se o email está verificado
  isEmailVerified: (user: User | null): boolean => {
    if (!user) return false;
    return user.email_confirmed_at !== null;
  },
  
  // Verificar se é um novo usuário
  isNewUser: (profile: UserProfile | null, user: User | null): boolean => {
    if (!profile || !user) return false;
    
    // Verificar se o perfil foi criado recentemente (menos de 1 hora)
    const createdAt = profile.created_at ? new Date(profile.created_at) : null;
    if (!createdAt) return false;
    
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return createdAt > oneHourAgo;
  },
  
  // Promover primeiro usuário para admin
  promoteFirstUserToAdmin: async (userId: string): Promise<boolean> => {
    try {
      // Verificar se já existe algum admin
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'admin');
        
      if (countError) throw countError;
      
      // Se não existir admin, promover este usuário
      if (count === 0) {
        const { error } = await supabase
          .from('profiles')
          .update({ user_type: 'admin' })
          .eq('id', userId);
          
        if (error) throw error;
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Erro ao promover usuário para admin:", err);
      return false;
    }
  }
};
