
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Faculdade, GradeCurricular, Disciplina, UserProgressoDisciplina, DisciplinaMaterial } from "@/types/curriculum";
import { toast } from "sonner";
import { useAuth } from "./use-auth";

export const useCurriculum = (faculdadeId?: string, gradeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPeriodo, setSelectedPeriodo] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all law schools
  const { data: faculdades, isLoading: isLoadingFaculdades } = useQuery({
    queryKey: ["faculdades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculdades")
        .select("*");

      if (error) throw error;
      return data as Faculdade[];
    }
  });

  // Get curricula for a specific law school
  const { data: grades, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["grades", faculdadeId],
    queryFn: async () => {
      if (!faculdadeId) return [];
      
      const { data, error } = await supabase
        .from("grade_curricular")
        .select("*")
        .eq("faculdade_id", faculdadeId);

      if (error) throw error;
      return data as GradeCurricular[];
    },
    enabled: !!faculdadeId
  });

  // Get disciplines for a specific curriculum and period
  const { data: disciplinas, isLoading: isLoadingDisciplinas } = useQuery({
    queryKey: ["disciplinas", gradeId, selectedPeriodo, searchQuery],
    queryFn: async () => {
      if (!gradeId) return [];
      
      let query = supabase
        .from("disciplinas")
        .select("*")
        .eq("grade_id", gradeId);
      
      if (!searchQuery) {
        // If no search query, filter by period
        query = query.eq("periodo", selectedPeriodo);
      } else {
        // If there's a search query, search across all periods
        query = query.or(`nome.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.order("periodo", { ascending: true });

      if (error) throw error;
      return data as Disciplina[];
    },
    enabled: !!gradeId
  });

  // Get all periods available in the curriculum
  const { data: periodos } = useQuery({
    queryKey: ["periodos", gradeId],
    queryFn: async () => {
      if (!gradeId) return [];
      
      const { data, error } = await supabase
        .from("disciplinas")
        .select("periodo")
        .eq("grade_id", gradeId)
        .order("periodo", { ascending: true });

      if (error) throw error;
      
      // Extract unique periods
      const uniquePeriods = [...new Set(data.map(item => item.periodo))];
      return uniquePeriods;
    },
    enabled: !!gradeId
  });

  // Get user progress for disciplines
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["userProgress", user?.id, disciplinas],
    queryFn: async () => {
      if (!user || !disciplinas?.length) return [];
      
      const disciplinaIds = disciplinas.map(d => d.id);
      
      const { data, error } = await supabase
        .from("user_progresso_disciplinas")
        .select("*")
        .eq("user_id", user.id)
        .in("disciplina_id", disciplinaIds);

      if (error) throw error;
      return data as UserProgressoDisciplina[];
    },
    enabled: !!user && !!disciplinas?.length
  });

  // Get materials for a discipline
  const fetchDisciplinaMaterials = useCallback(async (disciplinaId: string) => {
    const { data, error } = await supabase
      .from("disciplina_materiais")
      .select("*")
      .eq("disciplina_id", disciplinaId);

    if (error) throw error;
    return data as DisciplinaMaterial[];
  }, []);

  // Update user progress for a discipline
  const updateUserProgress = useMutation({
    mutationFn: async (progress: Partial<UserProgressoDisciplina> & { disciplina_id: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const existingProgress = userProgress?.find(p => p.disciplina_id === progress.disciplina_id);
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from("user_progresso_disciplinas")
          .update({
            ...progress,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProgress.id)
          .select("*")
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from("user_progresso_disciplinas")
          .insert({
            user_id: user.id,
            disciplina_id: progress.disciplina_id,
            status: progress.status || 'nao_iniciado',
            favorito: progress.favorito || false,
            progresso_percentual: progress.progresso_percentual || 0,
            nota: progress.nota || null,
            anotacoes: progress.anotacoes || null
          })
          .select("*")
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success("Progresso atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
      toast.error("Erro ao atualizar progresso");
    }
  });

  // Toggle favorite status for a discipline
  const toggleFavorite = useCallback((disciplinaId: string) => {
    const currentProgress = userProgress?.find(p => p.disciplina_id === disciplinaId);
    const newFavoriteStatus = !(currentProgress?.favorito || false);
    
    updateUserProgress.mutate({
      disciplina_id: disciplinaId,
      favorito: newFavoriteStatus
    });
  }, [userProgress, updateUserProgress]);

  // Update study status for a discipline
  const updateStudyStatus = useCallback((disciplinaId: string, status: UserProgressoDisciplina['status']) => {
    updateUserProgress.mutate({
      disciplina_id: disciplinaId,
      status
    });
  }, [updateUserProgress]);

  // Generate AI content about a discipline
  const generateAIContent = useCallback(async (subject: string, contentType: string) => {
    try {
      const response = await supabase.functions.invoke('generate-curriculum-content', {
        body: { subject, contentType }
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error("Erro ao gerar conteúdo AI");
      throw error;
    }
  }, []);

  return {
    faculdades,
    grades,
    disciplinas,
    periodos,
    userProgress,
    selectedPeriodo,
    setSelectedPeriodo,
    searchQuery,
    setSearchQuery,
    isLoading: isLoadingFaculdades || isLoadingGrades || isLoadingDisciplinas || isLoadingProgress,
    fetchDisciplinaMaterials,
    toggleFavorite,
    updateStudyStatus,
    updateUserProgress: updateUserProgress.mutate,
    generateAIContent
  };
};
