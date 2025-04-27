
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SimuladoCategoria, Questao, SimuladoSessao, SimuladoResposta } from "@/types/simulados";

export function useSimulado(categoria: SimuladoCategoria) {
  const queryClient = useQueryClient();

  // Fetch questions for a specific category
  const useQuestoes = (params: { ano?: number; area?: string } = {}) => {
    return useQuery({
      queryKey: ['simulados', categoria, 'questoes', params],
      queryFn: async () => {
        const query = supabase
          .from(`simulados_${categoria.toLowerCase()}`)
          .select('*');

        if (params.ano) {
          query.eq('ano', params.ano);
        }
        if (params.area) {
          query.eq('area', params.area);
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
        const { data: sessao, error } = await supabase
          .from('simulado_sessoes')
          .insert({
            categoria: data.categoria,
            total_questoes: data.total_questoes,
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
        const { data, error } = await supabase
          .from('simulado_estatisticas')
          .select('*')
          .eq('categoria', categoria);

        if (error) throw error;
        return data;
      },
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
