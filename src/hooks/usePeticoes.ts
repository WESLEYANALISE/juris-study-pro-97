import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Peticao {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  arquivo_url: string;
  created_at?: string;
  area: string;
  tipo: string;
  sub_area?: string;
  tags?: string[];
}

// Record from the database
interface PeticaoRecord {
  id: string;
  area: string;
  tipo: string;
  documento: string;
  // Other fields might be present but not required for our mapping
}

interface UsePeticoesOptions {
  initialFilters?: {
    area: string;
    subArea: string;
    tipo: string;
    tags: string[];
    search: string;
  };
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

  // Use React Query for data fetching with caching
  const { data: peticoes = [], isLoading, error, refetch } = useQuery({
    queryKey: ["peticoes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("peticoes")
          .select("*");

        if (error) {
          throw error;
        }

        // Map the data to match our interface
        return (data as PeticaoRecord[] || []).map(item => ({
          id: item.id || '',
          titulo: item.tipo || '',
          // Since descricao doesn't exist in the database, provide a default value
          descricao: 'Modelo de petição jurídica para uso profissional',
          categoria: item.area || '',
          arquivo_url: item.documento || '',
          created_at: new Date().toISOString(),
          area: item.area || '',
          tipo: item.tipo || '',
          // Extract potential sub-area from tipo field if available
          sub_area: item.tipo && item.tipo.includes("-") 
            ? item.tipo.split("-")[0].trim() 
            : undefined,
          // Add default tags based on area
          tags: [item.area]
        }));
      } catch (error) {
        console.error("Error loading peticoes:", error);
        toast.error("Erro ao carregar petições");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const filteredPeticoes = peticoes.filter((peticao) => {
    const matchesSearch = filters.search === "" || 
      peticao.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      peticao.area.toLowerCase().includes(filters.search.toLowerCase()) ||
      (peticao.descricao && peticao.descricao.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesArea = filters.area === "" || filters.area === "all" || 
      peticao.area === filters.area;
    
    const matchesSubArea = filters.subArea === "" || filters.subArea === "all" || 
      (peticao.sub_area && peticao.sub_area === filters.subArea);
    
    const matchesTipo = filters.tipo === "" || filters.tipo === "all" || 
      peticao.tipo === filters.tipo;
    
    const matchesTags = filters.tags.length === 0 || 
      (peticao.tags && filters.tags.every(tag => peticao.tags?.includes(tag)));
    
    return matchesSearch && matchesArea && matchesSubArea && matchesTipo && matchesTags;
  });

  // Group petições by area for display
  const peticoesByArea = {};
  filteredPeticoes.forEach(peticao => {
    if (!peticoesByArea[peticao.area]) {
      peticoesByArea[peticao.area] = [];
    }
    peticoesByArea[peticao.area].push(peticao);
  });

  // Calculate statistics for each area
  const areaStats = Object.entries(peticoesByArea).map(([area, areaPeticoes]) => ({
    area,
    count: (areaPeticoes as Peticao[]).length
  }));

  return {
    peticoes: filteredPeticoes,
    peticoesByArea,
    areaStats,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
    totalPeticoes: peticoes.length,
    totalAreas: Object.keys(peticoesByArea).length
  };
}
