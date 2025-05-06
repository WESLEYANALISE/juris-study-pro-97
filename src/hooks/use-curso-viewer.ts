
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Curso } from "@/types/curso";

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
  const { cursoId } = useParams<{ cursoId: string }>();
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
    
    if (cursoId) {
      const savedProgress = localStorage.getItem(`curso_${cursoId}_progress`);
      const savedNotes = localStorage.getItem(`curso_${cursoId}_notes`);
      const isComplete = localStorage.getItem(`curso_${cursoId}_complete`) === 'true';
      
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
  }, [cursoId]);

  useEffect(() => {
    const getCurso = async () => {
      // Only fetch if we don't have curso data and have an ID
      if (!state.curso && cursoId) {
        setState(prev => ({ ...prev, loading: true }));
        try {
          console.log("Fetching curso with ID:", cursoId);
          const { data, error } = await supabase
            .from("cursos_narrados")
            .select("*")
            .eq("id", parseInt(cursoId))
            .single();
            
          if (error) {
            console.error("Error fetching course:", error);
            throw error;
          }
          
          console.log("Curso data received:", data);
          
          // Convert sequencia from string to number and add it to our curso object
          const cursoData = {
            ...data,
            sequencia: data.sequencia ? parseInt(data.sequencia) : 0,
            titulo: data.materia, // Map materia to titulo for compatibility
            thumbnail: data.capa, // Map capa to thumbnail for compatibility
          };
          
          // Only update state if component is still mounted
          if (mountedRef.current) {
            setState(prev => ({ ...prev, curso: cursoData as Curso, loading: false }));
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          if (mountedRef.current) {
            toast.error("Erro ao carregar curso. Por favor, tente novamente.");
            setState(prev => ({ ...prev, loading: false }));
          }
        }
      }
    };
    
    getCurso();
  }, [cursoId, state.curso]);

  const handleStartCourse = useCallback(() => {
    // Batch state updates to avoid multiple renders
    setState(prev => ({ 
      ...prev, 
      menuOpen: false, 
      showCourse: true 
    }));
  }, []);

  const handleBack = useCallback(() => {
    if (state.progress > 0 && cursoId) {
      // Save progress before going back to menu
      localStorage.setItem(`curso_${cursoId}_progress`, state.progress.toString());
    }
    
    // Batch state updates to avoid multiple renders
    setState(prev => ({ 
      ...prev, 
      showCourse: false, 
      menuOpen: true 
    }));
  }, [cursoId, state.progress]);

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
    
    if (cursoId) {
      localStorage.setItem(`curso_${cursoId}_progress`, newProgress.toString());
      
      // If progress is 100%, mark as complete
      if (newProgress >= 100) {
        setState(prev => ({ ...prev, isComplete: true }));
        localStorage.setItem(`curso_${cursoId}_complete`, 'true');
        
        toast.success("Curso concluído! Parabéns por concluir este curso.");
      }
    }
  }, [cursoId]);

  const saveNotes = useCallback((notes: string) => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ 
      ...prev, 
      notes, 
      hasNotes: !!notes.trim() 
    }));
    
    if (cursoId) {
      if (notes.trim()) {
        localStorage.setItem(`curso_${cursoId}_notes`, notes);
      } else {
        localStorage.removeItem(`curso_${cursoId}_notes`);
      }
    }
  }, [cursoId]);

  const toggleBookmark = useCallback(() => {
    if (!cursoId) return false;
    
    const bookmarks = JSON.parse(localStorage.getItem('curso_bookmarks') || '[]');
    const isBookmarked = bookmarks.includes(Number(cursoId));
    
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((bookmarkId: number) => bookmarkId !== Number(cursoId));
      toast.success("Curso removido dos seus marcadores.");
    } else {
      newBookmarks = [...bookmarks, Number(cursoId)];
      toast.success("Curso adicionado aos seus marcadores.");
    }
    
    localStorage.setItem('curso_bookmarks', JSON.stringify(newBookmarks));
    return !isBookmarked;
  }, [cursoId]);
  
  const isBookmarked = useCallback(() => {
    if (!cursoId) return false;
    const bookmarks = JSON.parse(localStorage.getItem('curso_bookmarks') || '[]');
    return bookmarks.includes(Number(cursoId));
  }, [cursoId]);

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
