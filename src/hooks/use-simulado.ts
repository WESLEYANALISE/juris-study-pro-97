
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SimuladoCategoria, Questao, SimuladoSessao, SimuladoResposta } from "@/types/simulados";
import { useAuth } from "@/hooks/use-auth";

export function useSimulado(categoria: SimuladoCategoria) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch questions for a specific category
  const useQuestoes = (params: { ano?: number; area?: string } = {}) => {
    return useQuery({
      queryKey: ['simulados', categoria, 'questoes', params],
      queryFn: async () => {
        // Use hard-coded table name based on categoria instead of template literals
        let query;
        switch(categoria) {
          case 'OAB':
            query = supabase.from('simulados_oab').select('*');
            break;
          case 'PRF':
            query = supabase.from('simulados_prf').select('*');
            break;
          case 'PF':
            query = supabase.from('simulados_pf').select('*');
            break;
          case 'TJSP':
            query = supabase.from('simulados_tjsp').select('*');
            break;
          case 'JUIZ':
            query = supabase.from('simulados_juiz').select('*');
            break;
          case 'PROMOTOR':
            query = supabase.from('simulados_promotor').select('*');
            break;
          case 'DELEGADO':
            query = supabase.from('simulados_delegado').select('*');
            break;
          default:
            throw new Error(`Categoria inválida: ${categoria}`);
        }

        if (params.ano) {
          query = query.eq('ano', params.ano);
        }
        if (params.area) {
          query = query.eq('area', params.area);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Questao[];
      },
    });
  };

  // Create a new exam session
  const useCreateSessao = () => {
    return useMutation({
      mutationFn: async (data: Pick<SimuladoSessao, 'categoria' | 'total_questoes'>) => {
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const { data: sessao, error } = await supabase
          .from('simulado_sessoes')
          .insert({
            categoria: data.categoria,
            total_questoes: data.total_questoes,
            user_id: user.id // Add the user_id from auth
          })
          .select()
          .single();

        if (error) throw error;
        return sessao as SimuladoSessao;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['simulados', 'sessoes'] });
      },
    });
  };

  // Submit an answer
  const useSubmitResposta = () => {
    return useMutation({
      mutationFn: async (data: Omit<SimuladoResposta, 'id'>) => {
        const { data: resposta, error } = await supabase
          .from('simulado_respostas')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return resposta as SimuladoResposta;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['simulados', 'sessoes'] });
        queryClient.invalidateQueries({ queryKey: ['simulados', 'estatisticas'] });
      },
    });
  };

  // Fetch user statistics
  const useEstatisticas = () => {
    return useQuery({
      queryKey: ['simulados', categoria, 'estatisticas'],
      queryFn: async () => {
        if (!user) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('simulado_estatisticas')
          .select('*')
          .eq('categoria', categoria)
          .eq('user_id', user.id);

        if (error) throw error;
        return data;
      },
      enabled: !!user, // Only run query when user is authenticated
    });
  };

  // Fetch leaderboard
  const useLeaderboard = () => {
    return useQuery({
      queryKey: ['simulados', categoria, 'leaderboard'],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('get_simulado_leaderboard', {
            _categoria: categoria
          });

        if (error) throw error;
        return data;
      },
    });
  };

  return {
    useQuestoes,
    useCreateSessao,
    useSubmitResposta,
    useEstatisticas,
    useLeaderboard,
  };
}
