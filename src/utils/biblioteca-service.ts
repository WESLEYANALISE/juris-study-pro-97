import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeSelect } from './supabase-helpers';
import { formatPDFUrl } from './pdf-url-utils';

export interface LivroSupa {
  id: string; // Make sure this is defined as string to match our usage
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

// This function is now moved to pdf-url-utils.ts and imported above
// Keeping alias for backward compatibility
export { formatPDFUrl as formatPdfUrl };

/**
 * Ensures all URLs are properly formatted
 */
export function formatPdfUrl(url: string): string {
  // If it's already a complete URL, return it
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }

  // If it's a storage path, add the necessary prefix
  const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
  return `${storageBaseUrl}/storage/v1/object/public/agoravai/${url}`;
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
    
    // Make sure URLs are properly formatted and IDs are strings
    const formattedData = data?.map(book => ({
      ...book,
      id: String(book.id),
      pdf_url: formatPdfUrl(book.pdf_url)
    })) || [];
    
    // Group the books by area
    const groupedByArea = formattedData.reduce<{ [key: string]: LivroSupa[] }>((acc, book) => {
      const area = book.area || 'Sem Categoria';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(book);
      return acc;
    }, {});
    
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
      console.log("No user found when trying to save reading progress");
      return;
    }
    
    console.log("Saving reading progress:", { bookId, currentPage, isFavorite, userId: userData.user.id });
    
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
      toast.error('Não foi possível salvar seu progresso de leitura');
    } else {
      console.log("Reading progress saved successfully");
    }
  } catch (error) {
    console.error('Error in saveReadingProgress:', error);
    toast.error('Erro ao salvar progresso de leitura');
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
    
    // Extract the IDs for the query
    const bookIds = data.map(item => item.livro_id);
    
    // Get all books and filter manually
    const { data: booksData, error: booksError } = await supabase
      .from('livros_supa')
      .select('*');
    
    if (booksError) {
      console.error('Error fetching favorite books:', booksError);
      return [];
    }
    
    // Manually filter the books that match our book IDs
    const filteredBooks = (booksData || []).filter(book => 
      bookIds.includes(String(book.id))
    );
    
    // Ensure the returned data matches our LivroSupa interface
    return filteredBooks.map(book => ({
      id: String(book.id), // Convert id to string to match our interface
      pdf_name: book.pdf_name,
      area: book.area,
      pdf_url: formatPdfUrl(book.pdf_url),
      sinopse: book.sinopse,
      capa: book.capa,
      created_at: book.created_at
    }));
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
    
    // Extract the IDs for the query
    const bookIds = data.map(item => item.livro_id);
    
    // Get all books and filter manually
    const { data: booksData, error: booksError } = await supabase
      .from('livros_supa')
      .select('*');
    
    if (booksError) {
      console.error('Error fetching book details:', booksError);
      return [];
    }
    
    // Filter the books that match our book IDs
    const relevantBooks = (booksData || []).filter(book => 
      bookIds.includes(String(book.id))
    );
    
    // Combine the books data with reading progress and ensure types match our interface
    const booksWithProgress: LivroSupa[] = relevantBooks.map(book => {
      const progressItem = data.find(item => item.livro_id === String(book.id));
      return {
        id: String(book.id), // Convert id to string to match our interface
        pdf_name: book.pdf_name,
        area: book.area,
        pdf_url: formatPdfUrl(book.pdf_url),
        sinopse: book.sinopse,
        capa: book.capa,
        created_at: book.created_at,
        pagina_atual: progressItem?.pagina_atual
      };
    });
    
    return booksWithProgress;
  } catch (error) {
    console.error('Error in getRecentlyReadBooks:', error);
    return [];
  }
}
