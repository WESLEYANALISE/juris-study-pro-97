
import { supabase } from '@/integrations/supabase/client';
import { PDFLinkByArea, PDFArea } from '@/types/pdf-links';
import { safeSelect, safeInsert, safeUpdate, safeDelete } from './supabase-helpers';
import { toast } from 'sonner';

/**
 * Fetches all PDF links grouped by area
 */
export async function fetchPDFLinksByArea(): Promise<{ [key: string]: PDFLinkByArea[] }> {
  try {
    const { data, error } = await safeSelect<PDFLinkByArea>('pdf_links_by_area');
    
    if (error) {
      toast.error('Error fetching PDF links: ' + error.message);
      return {};
    }
    
    // Group the PDFs by area
    const groupedByArea = data?.reduce<{ [key: string]: PDFLinkByArea[] }>((acc, pdf) => {
      const area = pdf.area || 'Sem Categoria';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(pdf);
      return acc;
    }, {}) || {};
    
    return groupedByArea;
  } catch (error) {
    console.error('Error in fetchPDFLinksByArea:', error);
    toast.error('Error fetching PDF links');
    return {};
  }
}

/**
 * Fetches all available PDF areas with counts
 */
export async function fetchPDFAreas(): Promise<PDFArea[]> {
  try {
    // Using type assertion to overcome TypeScript limitations with dynamic table names
    const { data, error } = await (supabase.from('pdf_links_by_area') as any)
      .select('area')
      .order('area');
    
    if (error) {
      toast.error('Error fetching PDF areas: ' + error.message);
      return [];
    }
    
    // Count occurrences of each area
    const areaCount: { [area: string]: number } = {};
    (data as any[]).forEach(item => {
      const area = item.area || 'Sem Categoria';
      areaCount[area] = (areaCount[area] || 0) + 1;
    });
    
    // Convert to array of PDFArea objects
    const areas: PDFArea[] = Object.keys(areaCount).map(area => ({
      name: area,
      count: areaCount[area]
    }));
    
    return areas;
  } catch (error) {
    console.error('Error in fetchPDFAreas:', error);
    toast.error('Error fetching PDF areas');
    return [];
  }
}

/**
 * Fetches PDFs by specific area
 */
export async function fetchPDFsByArea(area: string): Promise<PDFLinkByArea[]> {
  try {
    const { data, error } = await safeSelect<PDFLinkByArea>(
      'pdf_links_by_area',
      '*',
      query => query.eq('area', area).order('pdf_name')
    );
    
    if (error) {
      toast.error('Error fetching PDFs by area: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchPDFsByArea:', error);
    toast.error('Error fetching PDFs for ' + area);
    return [];
  }
}

/**
 * Searches PDFs across all areas
 */
export async function searchPDFs(searchQuery: string): Promise<PDFLinkByArea[]> {
  try {
    const { data, error } = await safeSelect<PDFLinkByArea>(
      'pdf_links_by_area',
      '*',
      query => query
        .or(`pdf_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`)
        .order('pdf_name')
    );
    
    if (error) {
      toast.error('Error searching PDFs: ' + error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchPDFs:', error);
    toast.error('Error searching PDFs');
    return [];
  }
}

/**
 * Adds a new PDF link to the database
 */
export async function addPDFLink(pdfLink: Omit<PDFLinkByArea, 'id' | 'created_at'>): Promise<PDFLinkByArea | null> {
  try {
    const { data, error } = await safeInsert<PDFLinkByArea>(
      'pdf_links_by_area',
      pdfLink,
      { returning: '*' }
    );
    
    if (error) {
      toast.error('Error adding PDF link: ' + error.message);
      return null;
    }
    
    toast.success('PDF added successfully');
    return data && data[0] ? data[0] : null;
  } catch (error) {
    console.error('Error in addPDFLink:', error);
    toast.error('Error adding PDF link');
    return null;
  }
}
