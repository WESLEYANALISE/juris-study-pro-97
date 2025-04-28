
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  progress: number;
  hasNotes: boolean;
  notes: string;
  isComplete: boolean;
}

export function useCursoViewer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const initialized = useRef(false);
  const mountedRef = useRef(true);
  
  const [state, setState] = useState<CursoViewerState>({
    curso: location.state?.curso || null,
    loading: !location.state?.curso,
    menuOpen: true,
    showCourse: false,
    progress: 0,
    hasNotes: false,
    notes: "",
    isComplete: false,
  });

  // Set mountedRef to false when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load saved progress and notes from localStorage
  useEffect(() => {
    // Skip if already initialized in StrictMode
    if (initialized.current) return;
    
    if (id) {
      const savedProgress = localStorage.getItem(`curso_${id}_progress`);
      const savedNotes = localStorage.getItem(`curso_${id}_notes`);
      const isComplete = localStorage.getItem(`curso_${id}_complete`) === 'true';
      
      if (savedProgress || savedNotes || isComplete) {
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            progress: savedProgress ? Number(savedProgress) : 0,
            notes: savedNotes || "",
            hasNotes: !!savedNotes,
            isComplete
          }));
        }
      }
      
      initialized.current = true;
    }
  }, [id]);

  useEffect(() => {
    const getCurso = async () => {
      // Only fetch if we don't have curso data and have an ID
      if (!state.curso && id) {
        setState(prev => ({ ...prev, loading: true }));
        try {
          const { data, error } = await supabase
            .from("cursos_narrados")
            .select("*")
            .eq("id", parseInt(id))
            .single();
            
          if (error) throw error;
          
          // Only update state if component is still mounted
          if (mountedRef.current) {
            setState(prev => ({ ...prev, curso: data as Curso, loading: false }));
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          if (mountedRef.current) {
            toast({
              variant: "destructive",
              title: "Erro ao carregar curso",
              description: "Não foi possível carregar as informações do curso.",
            });
            setState(prev => ({ ...prev, loading: false }));
          }
        }
      }
    };
    
    getCurso();
    
    // Cleanup function
    return () => {
      // Any cleanup needed (handled by mountedRef)
    };
  }, [id]);

  const handleStartCourse = useCallback(() => {
    // Batch state updates to avoid multiple renders
    setState(prev => ({ 
      ...prev, 
      menuOpen: false, 
      showCourse: true 
    }));
  }, []);

  const handleBack = useCallback(() => {
    if (state.progress > 0 && id) {
      // Save progress before going back to menu
      localStorage.setItem(`curso_${id}_progress`, state.progress.toString());
    }
    
    // Batch state updates to avoid multiple renders
    setState(prev => ({ 
      ...prev, 
      showCourse: false, 
      menuOpen: true 
    }));
  }, [id, state.progress]);

  const handleNavigateBack = useCallback(() => {
    navigate("/cursos");
  }, [navigate]);

  const setMenuOpen = useCallback((open: boolean) => {
    // Only toggle menu state when user is explicitly opening/closing it
    setState(prev => ({ ...prev, menuOpen: open }));
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ ...prev, progress: newProgress }));
    
    if (id) {
      localStorage.setItem(`curso_${id}_progress`, newProgress.toString());
      
      // If progress is 100%, mark as complete
      if (newProgress >= 100) {
        setState(prev => ({ ...prev, isComplete: true }));
        localStorage.setItem(`curso_${id}_complete`, 'true');
        
        toast({
          title: "Curso concluído!",
          description: "Parabéns por concluir este curso.",
          variant: "success",
        });
      }
    }
  }, [id]);

  const saveNotes = useCallback((notes: string) => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ 
      ...prev, 
      notes, 
      hasNotes: !!notes.trim() 
    }));
    
    if (id) {
      if (notes.trim()) {
        localStorage.setItem(`curso_${id}_notes`, notes);
      } else {
        localStorage.removeItem(`curso_${id}_notes`);
      }
    }
  }, [id]);

  const toggleBookmark = useCallback(() => {
    if (!id) return false;
    
    const bookmarks = JSON.parse(localStorage.getItem('curso_bookmarks') || '[]');
    const isBookmarked = bookmarks.includes(Number(id));
    
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((bookmarkId: number) => bookmarkId !== Number(id));
      toast({
        title: "Marcador removido",
        description: "Curso removido dos seus marcadores."
      });
    } else {
      newBookmarks = [...bookmarks, Number(id)];
      toast({
        title: "Curso marcado",
        description: "Curso adicionado aos seus marcadores."
      });
    }
    
    localStorage.setItem('curso_bookmarks', JSON.stringify(newBookmarks));
    return !isBookmarked;
  }, [id]);
  
  const isBookmarked = useCallback(() => {
    if (!id) return false;
    const bookmarks = JSON.parse(localStorage.getItem('curso_bookmarks') || '[]');
    return bookmarks.includes(Number(id));
  }, [id]);

  return {
    ...state,
    setMenuOpen,
    handleStartCourse,
    handleBack,
    handleNavigateBack,
    updateProgress,
    saveNotes,
    toggleBookmark,
    isBookmarked: isBookmarked(),
    videoRef
  };
}
