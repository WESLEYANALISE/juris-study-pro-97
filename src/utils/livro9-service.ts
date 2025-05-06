
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Livro9Item {
  id: string;
  pdf_name: string;
  area: string;
  pdf_url: string;
  original_path?: string;
  description?: string;
  total_pages?: number;
  created_at: string;
}

export interface Livro9Area {
  name: string;
  count: number;
}

/**
 * Fetches all PDF links from livro9 grouped by area
 */
export async function fetchLivro9ByArea(): Promise<{ [key: string]: Livro9Item[] }> {
  try {
    const { data, error } = await (supabase.from('livro9') as any).select('*');
    
    if (error) {
      toast.error('Error fetching livro9 PDFs: ' + error.message);
      return {};
    }
    
    // Group the PDFs by area
    const groupedByArea = data?.reduce<{ [key: string]: Livro9Item[] }>((acc, pdf) => {
      const area = pdf.area || 'Sem Categoria';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(pdf);
      return acc;
    }, {}) || {};
    
    return groupedByArea;
  } catch (error) {
    console.error('Error in fetchLivro9ByArea:', error);
    toast.error('Error fetching livro9 PDFs');
    return {};
  }
}

/**
 * Fetches all available PDF areas with counts from livro9
 */
export async function fetchLivro9Areas(): Promise<Livro9Area[]> {
  try {
    const query = supabase.from('livro9' as any) as any;
    const { data, error } = await query.select('area').order('area');
    
    if (error) {
      toast.error('Error fetching livro9 areas: ' + error.message);
      return [];
    }
    
    // Count occurrences of each area
    const areaCount: { [area: string]: number } = {};
    (data as any[]).forEach(item => {
      const area = item.area || 'Sem Categoria';
      areaCount[area] = (areaCount[area] || 0) + 1;
    });
    
    // Convert to array of Area objects
    const areas: Livro9Area[] = Object.keys(areaCount).map(area => ({
      name: area,
      count: areaCount[area]
    }));
    
    return areas;
  } catch (error) {
    console.error('Error in fetchLivro9Areas:', error);
    toast.error('Error fetching livro9 areas');
    return [];
  }
}

/**
 * Fetches PDFs from livro9 by specific area
 */
export async function fetchLivro9ByAreaName(area: string): Promise<Livro9Item[]> {
  try {
    const query = supabase.from('livro9' as any) as any;
    const builtQuery = area === 'all' 
      ? query.select('*').order('pdf_name')
      : query.select('*').eq('area', area).order('pdf_name');
    
    const { data, error } = await builtQuery;
    
    if (error) {
      toast.error('Error fetching livro9 PDFs by area: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchLivro9ByAreaName:', error);
    toast.error('Error fetching livro9 PDFs');
    return [];
  }
}

/**
 * Searches PDFs in livro9 across all areas
 */
export async function searchLivro9(searchQuery: string): Promise<Livro9Item[]> {
  try {
    const query = supabase.from('livro9' as any) as any;
    const { data, error } = await query
      .select('*')
      .or(`pdf_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`)
      .order('pdf_name');
    
    if (error) {
      toast.error('Error searching livro9 PDFs: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchLivro9:', error);
    toast.error('Error searching livro9 PDFs');
    return [];
  }
}
