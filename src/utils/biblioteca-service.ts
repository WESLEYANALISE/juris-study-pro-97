
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeSelect } from './supabase-helpers';

export interface LivroSupa {
  id: string;
  pdf_name: string;
  area: string;
  pdf_url: string;
  sinopse: string | null;
  capa: string | null;
  created_at: string;
  pagina_atual?: number; // Optional property for progress
}

export interface LibraryArea {
  name: string;
  count: number;
}

/**
 * Fetches all books grouped by area
 */
export async function fetchBooksByArea(): Promise<{ [key: string]: LivroSupa[] }> {
  try {
    const { data, error } = await safeSelect<LivroSupa>('livros_supa');
    
    if (error) {
      toast.error('Erro ao carregar biblioteca: ' + error.message);
      return {};
    }
    
    // Group the books by area
    const groupedByArea = data?.reduce<{ [key: string]: LivroSupa[] }>((acc, book) => {
      const area = book.area || 'Sem Categoria';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(book);
      return acc;
    }, {}) || {};
    
    return groupedByArea;
  } catch (error) {
    console.error('Error in fetchBooksByArea:', error);
    toast.error('Erro ao carregar biblioteca');
    return {};
  }
}

/**
 * Fetches all available book areas with counts
 */
export async function fetchBookAreas(): Promise<LibraryArea[]> {
  try {
    const { data, error } = await safeSelect<{ area: string }>('livros_supa', 'area');
    
    if (error) {
      toast.error('Erro ao carregar áreas da biblioteca: ' + error.message);
      return [];
    }
    
    // Count occurrences of each area
    const areaCount: { [area: string]: number } = {};
    (data as any[]).forEach(item => {
      const area = item.area || 'Sem Categoria';
      areaCount[area] = (areaCount[area] || 0) + 1;
    });
    
    // Convert to array of LibraryArea objects
    const areas: LibraryArea[] = Object.keys(areaCount).map(area => ({
      name: area,
      count: areaCount[area]
    }));
    
    // Sort areas alphabetically
    return areas.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error in fetchBookAreas:', error);
    toast.error('Erro ao carregar áreas da biblioteca');
    return [];
  }
}

/**
 * Fetches books by specific area name
 */
export async function fetchBooksByAreaName(area: string): Promise<LivroSupa[]> {
  try {
    const { data, error } = await safeSelect<LivroSupa>('livros_supa', '*', 
      query => area === 'all' 
        ? query.order('pdf_name') 
        : query.eq('area', area).order('pdf_name')
    );
    
    if (error) {
      toast.error('Erro ao carregar livros por área: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchBooksByAreaName:', error);
    toast.error('Erro ao carregar livros');
    return [];
  }
}

/**
 * Searches books across all areas
 */
export async function searchBooks(searchQuery: string): Promise<LivroSupa[]> {
  try {
    const { data, error } = await safeSelect<LivroSupa>('livros_supa', '*', 
      query => query
        .or(`pdf_name.ilike.%${searchQuery}%,sinopse.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`)
        .order('pdf_name')
    );
    
    if (error) {
      toast.error('Erro na busca de livros: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchBooks:', error);
    toast.error('Erro na busca de livros');
    return [];
  }
}

/**
 * Saves user reading progress
 */
export async function saveReadingProgress(
  bookId: string,
  currentPage: number,
  isFavorite: boolean = false
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      // Silently fail if no user
      return;
    }
    
    const { error } = await supabase
      .from('biblioteca_leitura_progresso')
      .upsert({
        livro_id: bookId,
        pagina_atual: currentPage,
        favorito: isFavorite,
        ultima_leitura: new Date().toISOString(),
        user_id: userData.user.id
      });
    
    if (error) {
      console.error('Error saving reading progress:', error);
    }
  } catch (error) {
    console.error('Error in saveReadingProgress:', error);
  }
}

/**
 * Gets user reading progress for a book
 */
export async function getReadingProgress(bookId: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('biblioteca_leitura_progresso')
      .select('*')
      .eq('livro_id', bookId)
      .eq('user_id', userData.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      console.error('Error fetching reading progress:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getReadingProgress:', error);
    return null;
  }
}

/**
 * Gets user favorite books
 */
export async function getFavoriteBooks(): Promise<LivroSupa[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      return [];
    }
    
    // First get the favorite book IDs
    const { data, error } = await supabase
      .from('biblioteca_leitura_progresso')
      .select('livro_id')
      .eq('user_id', userData.user.id)
      .eq('favorito', true);
    
    if (error) {
      console.error('Error fetching favorite books IDs:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Then get the actual book data
    const bookIds = data.map(item => item.livro_id);
    const { data: booksData, error: booksError } = await supabase
      .from('livros_supa')
      .select('*')
      .in('id', bookIds);
    
    if (booksError) {
      console.error('Error fetching favorite books:', booksError);
      return [];
    }
    
    return booksData || [];
  } catch (error) {
    console.error('Error in getFavoriteBooks:', error);
    return [];
  }
}

/**
 * Gets recently read books
 */
export async function getRecentlyReadBooks(limit: number = 5): Promise<LivroSupa[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      return [];
    }
    
    // Get recently read book IDs with progress info
    const { data, error } = await supabase
      .from('biblioteca_leitura_progresso')
      .select('livro_id, pagina_atual, ultima_leitura')
      .eq('user_id', userData.user.id)
      .order('ultima_leitura', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recently read books:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get the actual book details
    const bookIds = data.map(item => item.livro_id);
    const { data: booksData, error: booksError } = await supabase
      .from('livros_supa')
      .select('*')
      .in('id', bookIds);
    
    if (booksError) {
      console.error('Error fetching book details:', booksError);
      return [];
    }
    
    // Combine the books data with reading progress
    const booksWithProgress = booksData?.map(book => {
      const progressItem = data.find(item => item.livro_id === book.id);
      return {
        ...book,
        pagina_atual: progressItem?.pagina_atual
      };
    }) || [];
    
    return booksWithProgress;
  } catch (error) {
    console.error('Error in getRecentlyReadBooks:', error);
    return [];
  }
}
