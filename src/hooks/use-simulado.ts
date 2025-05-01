
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SimuladoCategoria, Questao, SimuladoSessao, SimuladoResposta, SimuladoEdicao } from "@/types/simulados";
import { useAuth } from "@/hooks/use-auth";

export function useSimulado(categoria: SimuladoCategoria) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch available editions for a category
  const useEdicoes = () => {
    return useQuery({
      queryKey: ['simulados', categoria, 'edicoes'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('simulado_edicoes')
          .select('*')
          .eq('categoria', categoria)
          .order('ano', { ascending: false })
          .order('numero', { ascending: false });
          
        if (error) throw error;
        return data as SimuladoEdicao[];
      },
    });
  };

  // Fetch questions for a specific edition
  const useQuestoesEdicao = (edicaoId: string) => {
    return useQuery({
      queryKey: ['simulados', 'edicao', edicaoId, 'questoes'],
      queryFn: async () => {
        // Get the edition details first
        const { data: edicao, error: edicaoError } = await supabase
          .from('simulado_edicoes')
          .select('*')
          .eq('id', edicaoId)
          .single();
          
        if (edicaoError) throw edicaoError;
        
        if (!edicao) throw new Error("Edição não encontrada");
        
        // Use hard-coded table name based on categoria instead of template literals
        let query;
        switch(edicao.categoria) {
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
            throw new Error(`Categoria inválida: ${edicao.categoria}`);
        }

        // Add edition filter
        query = query.eq('edicao_id', edicaoId);

        const { data, error } = await query;
        if (error) throw error;
        
        return {
          questoes: data as Questao[],
          edicao: edicao as SimuladoEdicao
        };
      },
      enabled: Boolean(edicaoId),
    });
  };

  // Fetch questions for a specific category (legacy function)
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
      mutationFn: async (data: { categoria: SimuladoCategoria; edicaoId: string }) => {
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        // Get edition details to know how many questions
        const { data: edicaoData, error: edicaoError } = await supabase
          .from('simulado_edicoes')
          .select('*')
          .eq('id', data.edicaoId)
          .single();
          
        if (edicaoError) throw edicaoError;
        if (!edicaoData) throw new Error("Edição não encontrada");

        const { data: sessao, error } = await supabase
          .from('simulado_sessoes')
          .insert({
            categoria: data.categoria,
            edicao_id: data.edicaoId,
            total_questoes: edicaoData.total_questoes,
            user_id: user.id
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
    useQuestoesEdicao,
    useEdicoes,
    useCreateSessao,
    useSubmitResposta,
    useEstatisticas,
    useLeaderboard,
  };
}
