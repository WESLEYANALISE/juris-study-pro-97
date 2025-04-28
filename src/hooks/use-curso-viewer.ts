
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

interface Curso {
  id: number;
  area: string;
  materia: string;
  sequencia: number;
  link: string;
  capa: string;
  sobre: string;
  download: string | null;
}

interface CursoViewerState {
  curso: Curso | null;
  loading: boolean;
  menuOpen: boolean;
  showCourse: boolean;
}

export function useCursoViewer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<CursoViewerState>({
    curso: location.state?.curso || null,
    loading: !location.state?.curso,
    menuOpen: true,
    showCourse: false,
  });

  useEffect(() => {
    const getCurso = async () => {
      if (!state.curso && id) {
        setState(prev => ({ ...prev, loading: true }));
        try {
          const { data, error } = await supabase
            .from("cursos_narrados")
            .select("*")
            .eq("id", parseInt(id))
            .single();
            
          if (error) throw error;
          setState(prev => ({ ...prev, curso: data as Curso, loading: false }));
        } catch (error) {
          console.error("Error fetching course:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar curso",
            description: "Não foi possível carregar as informações do curso.",
          });
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };
    
    getCurso();
  }, [id, state.curso]);

  const handleStartCourse = () => {
    setState(prev => ({ ...prev, menuOpen: false, showCourse: true }));
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, showCourse: false, menuOpen: true }));
  };

  const handleNavigateBack = () => {
    navigate("/cursos");
  };

  const setMenuOpen = (open: boolean) => {
    setState(prev => ({ ...prev, menuOpen: open }));
  };

  return {
    ...state,
    setMenuOpen,
    handleStartCourse,
    handleBack,
    handleNavigateBack,
  };
}
