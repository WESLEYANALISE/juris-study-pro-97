
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlanoEstudos {
  id: string;
  user_id: string;
  area_interesse: string[];
  objetivo: string;
  nivel_atual: string;
  horas_estudo_semana: number;
  concluido: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}

export function usePlanoEstudos() {
  const { user } = useAuth();
  const [plano, setPlano] = useState<PlanoEstudos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlanoEstudos = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('plano_estudos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setPlano(data);
    } catch (err: any) {
      console.error('Erro ao buscar plano de estudos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress: number) => {
    if (!user || !plano) {
      return { success: false, error: new Error('Usuário não autenticado ou plano não encontrado') };
    }

    try {
      const { error: updateError } = await supabase
        .from('plano_estudos')
        .update({ progress: newProgress })
        .eq('id', plano.id);

      if (updateError) throw updateError;

      // Atualizar o estado local
      setPlano({
        ...plano,
        progress: newProgress
      });

      return { success: true, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar progresso:', err);
      return { success: false, error: err };
    }
  };

  const updatePlanoEstudos = async (updates: Partial<Omit<PlanoEstudos, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !plano) {
      return { success: false, error: new Error('Usuário não autenticado ou plano não encontrado') };
    }

    try {
      const { error: updateError } = await supabase
        .from('plano_estudos')
        .update(updates)
        .eq('id', plano.id);

      if (updateError) throw updateError;

      // Atualizar o estado local
      setPlano({
        ...plano,
        ...updates
      });

      toast.success('Plano de estudos atualizado com sucesso!');
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar plano de estudos:', err);
      toast.error('Erro ao atualizar plano de estudos.');
      return { success: false, error: err };
    }
  };

  const createPlanoEstudos = async (newPlano: Omit<PlanoEstudos, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('plano_estudos')
        .insert({
          user_id: user.id,
          ...newPlano
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setPlano(data);
      toast.success('Plano de estudos criado com sucesso!');
      return { success: true, error: null, data };
    } catch (err: any) {
      console.error('Erro ao criar plano de estudos:', err);
      toast.error('Erro ao criar plano de estudos.');
      return { success: false, error: err, data: null };
    }
  };

  useEffect(() => {
    fetchPlanoEstudos();
  }, [user]);

  return {
    plano,
    loading,
    error,
    updateProgress,
    updatePlanoEstudos,
    createPlanoEstudos,
    refreshPlano: fetchPlanoEstudos,
  };
}
