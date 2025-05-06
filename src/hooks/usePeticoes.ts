
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Updated interface for petições from the database
export interface Peticao {
  id: string;
  area: string;
  total: number;
  link: string;
  icon_color?: string;
  tipo?: string;
  sub_area?: string;
  tags?: string[];
  titulo?: string;
  descricao?: string;
  arquivo_url?: string;
  created_at?: string;
}

// Database record from the peticoes table
export interface PeticaoRecord {
  id: string;
  area: string;
  total: number; 
  link: string;
  icon_color?: string;
  last_updated?: string;
}

interface UsePeticoesOptions {
  initialFilters?: {
    area: string;
    subArea: string;
    tipo: string;
    tags: string[];
    search: string;
  };
  page?: number;
  pageSize?: number;
}

export function usePeticoes(options: UsePeticoesOptions = {}) {
  const [filters, setFilters] = useState({
    area: "",
    subArea: "",
    tipo: "",
    tags: [] as string[],
    search: "",
    ...options.initialFilters
  });
  
  const [page, setPage] = useState(options.page || 1);
  const pageSize = options.pageSize || 12;
  
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueAreas, setUniqueAreas] = useState<string[]>([]);

  // Fetch all unique areas separately to ensure we have the complete list regardless of pagination
  const { data: allAreas = [] } = useQuery({
    queryKey: ["peticoes-areas"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("peticoes")
          .select("area")
          .order("area");
        
        if (error) throw error;
        
        // Extract unique areas
        const areas = [...new Set(data.map(item => item.area).filter(Boolean))];
        setUniqueAreas(areas);
        return areas;
      } catch (error) {
        console.error("Error loading areas:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Use React Query for data fetching with caching
  const { 
    data: peticoes = [], 
    isLoading, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ["peticoes", page, pageSize, filters],
    queryFn: async () => {
      try {
        // First, get the total count for pagination
        let countQuery = supabase
          .from("peticoes")
          .select("*", { count: "exact", head: true });
          
        // Apply filters to count query if provided
        if (filters.area && filters.area !== "all") {
          countQuery = countQuery.eq("area", filters.area);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
        setTotalCount(count || 0);
        
        // Build the query with filters
        let query = supabase
          .from("peticoes")
          .select("*");
        
        // Apply filters if provided
        if (filters.area && filters.area !== "all") {
          query = query.eq("area", filters.area);
        }
        
        // Apply pagination
        query = query
          .range((page - 1) * pageSize, page * pageSize - 1)
          .order("area", { ascending: true });
        
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Map the data to match our interface - cast first to solve TypeScript issues
        return (data as unknown as PeticaoRecord[]).map(item => ({
          id: String(item.id),
          area: item.area,
          total: item.total,
          link: item.link,
          icon_color: item.icon_color,
          // Add these fields to match the expected interface
          titulo: item.area,
          descricao: 'Modelo de petição jurídica para uso profissional',
          categoria: item.area,
          arquivo_url: item.link,
          created_at: item.last_updated || new Date().toISOString(),
          // Set optional properties
          tipo: "",
          sub_area: undefined,
          tags: [item.area]
        })) as Peticao[];
      } catch (error) {
        console.error("Error loading peticoes:", error);
        toast.error("Erro ao carregar petições");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const filteredPeticoes = useCallback(() => {
    return peticoes.filter((peticao) => {
      const matchesSearch = !filters.search || 
        peticao.area.toLowerCase().includes(filters.search.toLowerCase()) ||
        (peticao.descricao && peticao.descricao.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesSubArea = !filters.subArea || filters.subArea === "all" || 
        (peticao.sub_area && peticao.sub_area === filters.subArea);
      
      const matchesTags = filters.tags.length === 0 || 
        (peticao.tags && filters.tags.every(tag => peticao.tags?.includes(tag)));
      
      return matchesSearch && matchesSubArea && matchesTags;
    });
  }, [peticoes, filters]);

  // Calculate peticoesByArea more efficiently
  const peticoesByArea = useCallback(() => {
    const result: Record<string, Peticao[]> = {};
    const filteredItems = filteredPeticoes();
    
    filteredItems.forEach(peticao => {
      if (!result[peticao.area]) {
        result[peticao.area] = [];
      }
      result[peticao.area].push(peticao);
    });
    
    return result;
  }, [filteredPeticoes]);

  // Calculate area stats
  const areaStats = useCallback(() => {
    const byArea = peticoesByArea();
    return Object.entries(byArea).map(([area, areaPeticoes]) => ({
      area,
      count: areaPeticoes.length
    }));
  }, [peticoesByArea]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    peticoes: filteredPeticoes(),
    peticoesByArea: peticoesByArea(),
    areaStats: areaStats(),
    filters,
    setFilters,
    isLoading,
    isFetching,
    error,
    refetch,
    totalPeticoes: totalCount,
    totalAreas: uniqueAreas.length,
    allAreas: uniqueAreas,
    // Pagination
    page,
    setPage,
    totalPages,
    pageSize
  };
}
