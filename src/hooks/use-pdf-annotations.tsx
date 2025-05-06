
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Annotation {
  id?: string;
  user_id: string;
  book_id: string;
  page: number;
  text: string;
  color: string;
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  created_at?: string;
}

export interface Bookmark {
  id?: string;
  user_id: string;
  book_id: string;
  page: number;
  title: string;
  color?: string;
  created_at?: string;
}

export function usePdfAnnotations(bookId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load annotations and bookmarks when component mounts
  useEffect(() => {
    if (user && bookId) {
      loadAnnotations();
      loadBookmarks();
    }
  }, [user, bookId]);

  // Load annotations from the database
  const loadAnnotations = async () => {
    if (!user || !bookId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('biblioteca_anotacoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('livro_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading annotations:', error);
        return;
      }

      setAnnotations(data || []);
    } catch (error) {
      console.error('Error in loadAnnotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load bookmarks from the database
  const loadBookmarks = async () => {
    if (!user || !bookId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('biblioteca_marcadores')
        .select('*')
        .eq('user_id', user.id)
        .eq('livro_id', bookId)
        .order('pagina', { ascending: true });

      if (error) {
        console.error('Error loading bookmarks:', error);
        return;
      }

      setBookmarks(data || []);
    } catch (error) {
      console.error('Error in loadBookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new annotation
  const addAnnotation = async (annotation: Omit<Annotation, 'user_id'>) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar anotações');
      return null;
    }

    try {
      const newAnnotation = {
        ...annotation,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('biblioteca_anotacoes')
        .insert([newAnnotation])
        .select()
        .single();

      if (error) {
        console.error('Error adding annotation:', error);
        toast.error('Erro ao salvar anotação');
        return null;
      }

      setAnnotations(prev => [data, ...prev]);
      toast.success('Anotação salva com sucesso');
      return data;
    } catch (error) {
      console.error('Error in addAnnotation:', error);
      toast.error('Erro ao salvar anotação');
      return null;
    }
  };

  // Update an existing annotation
  const updateAnnotation = async (id: string, updates: Partial<Annotation>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_anotacoes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating annotation:', error);
        toast.error('Erro ao atualizar anotação');
        return false;
      }

      setAnnotations(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Anotação atualizada');
      return true;
    } catch (error) {
      console.error('Error in updateAnnotation:', error);
      toast.error('Erro ao atualizar anotação');
      return false;
    }
  };

  // Delete an annotation
  const deleteAnnotation = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_anotacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting annotation:', error);
        toast.error('Erro ao excluir anotação');
        return false;
      }

      setAnnotations(prev => prev.filter(item => item.id !== id));
      toast.success('Anotação excluída');
      return true;
    } catch (error) {
      console.error('Error in deleteAnnotation:', error);
      toast.error('Erro ao excluir anotação');
      return false;
    }
  };

  // Add a new bookmark
  const addBookmark = async (bookmark: Omit<Bookmark, 'user_id'>) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar marcadores');
      return null;
    }

    try {
      const newBookmark = {
        ...bookmark,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('biblioteca_marcadores')
        .insert([newBookmark])
        .select()
        .single();

      if (error) {
        console.error('Error adding bookmark:', error);
        toast.error('Erro ao salvar marcador');
        return null;
      }

      setBookmarks(prev => [data, ...prev]);
      toast.success('Marcador adicionado');
      return data;
    } catch (error) {
      console.error('Error in addBookmark:', error);
      toast.error('Erro ao salvar marcador');
      return null;
    }
  };

  // Update a bookmark
  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_marcadores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating bookmark:', error);
        toast.error('Erro ao atualizar marcador');
        return false;
      }

      setBookmarks(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Marcador atualizado');
      return true;
    } catch (error) {
      console.error('Error in updateBookmark:', error);
      toast.error('Erro ao atualizar marcador');
      return false;
    }
  };

  // Delete a bookmark
  const deleteBookmark = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_marcadores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting bookmark:', error);
        toast.error('Erro ao excluir marcador');
        return false;
      }

      setBookmarks(prev => prev.filter(item => item.id !== id));
      toast.success('Marcador excluído');
      return true;
    } catch (error) {
      console.error('Error in deleteBookmark:', error);
      toast.error('Erro ao excluir marcador');
      return false;
    }
  };

  // Get annotations for a specific page
  const getAnnotationsForPage = (pageNumber: number) => {
    return annotations.filter(anno => anno.page === pageNumber);
  };

  // Check if a page is bookmarked
  const isPageBookmarked = (pageNumber: number) => {
    return bookmarks.some(bm => bm.page === pageNumber);
  };

  // Get bookmark for a specific page (if exists)
  const getBookmarkForPage = (pageNumber: number) => {
    return bookmarks.find(bm => bm.page === pageNumber);
  };

  // Export all annotations to text
  const exportAnnotationsToText = () => {
    if (annotations.length === 0) {
      toast.error('Nenhuma anotação para exportar');
      return null;
    }

    let content = `ANOTAÇÕES DO LIVRO\n\n`;
    
    // Group annotations by page
    const groupedByPage = annotations.reduce((acc, anno) => {
      if (!acc[anno.page]) acc[anno.page] = [];
      acc[anno.page].push(anno);
      return acc;
    }, {} as Record<number, Annotation[]>);

    // Build text content
    Object.keys(groupedByPage).sort((a, b) => Number(a) - Number(b)).forEach(page => {
      content += `\n==== PÁGINA ${page} ====\n\n`;
      
      groupedByPage[Number(page)].forEach(anno => {
        content += `- ${anno.text}\n`;
        if (anno.created_at) {
          content += `  Criado em: ${new Date(anno.created_at).toLocaleDateString()}\n`;
        }
        content += '\n';
      });
    });

    return content;
  };

  return {
    annotations,
    bookmarks,
    isLoading,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getAnnotationsForPage,
    isPageBookmarked,
    getBookmarkForPage,
    exportAnnotationsToText
  };
}
