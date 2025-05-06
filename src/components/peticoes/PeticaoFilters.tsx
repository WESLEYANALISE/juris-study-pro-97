
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FiltersState {
  area: string;
  subArea: string;
  tipo: string;
  tags: string[];
  search: string;
}

interface PeticaoFiltersProps {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  allAreas?: string[]; // Accept pre-loaded areas
}

export function PeticaoFilters({ filters, setFilters, allAreas = [] }: PeticaoFiltersProps) {
  // Use cached areas if provided, otherwise fetch them
  const { data: areas = allAreas, isLoading: isLoadingAreas } = useQuery({
    queryKey: ["peticoes-areas-filter"],
    queryFn: async () => {
      // If we already have areas from the parent, use those
      if (allAreas.length > 0) return allAreas;
      
      const { data } = await supabase
        .from("peticoes")
        .select("area")
        .order("area");
      
      return [...new Set(data?.map((item) => item.area))];
    },
    enabled: allAreas.length === 0, // Only fetch if we don't already have areas
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Only fetch tipos when an area is selected to reduce queries
  const { data: tipos = [], isLoading: isLoadingTipos } = useQuery({
    queryKey: ["peticoes-tipos", filters.area],
    queryFn: async () => {
      try {
        let query = supabase
          .from("peticoes")
          .select("documento");
          
        // Filter by area if selected
        if (filters.area && filters.area !== "all") {
          query = query.eq("area", filters.area);
        }
        
        query = query.order("documento");
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching tipos:", error);
          return [];
        }
        
        // Filter out null values and get unique documento values
        return [...new Set(data?.map((item) => item.documento).filter(Boolean))];
      } catch (e) {
        console.error("Exception fetching tipos:", e);
        return [];
      }
    },
    enabled: true, // Always load tipos, but will be filtered by area if selected
    staleTime: 5 * 60 * 1000,
  });

  // Only extract sub-areas if needed
  const { data: subAreas = [], isLoading: isLoadingSubAreas } = useQuery({
    queryKey: ["peticoes-subareas", filters.area],
    queryFn: async () => {
      if (!filters.area || filters.area === "all") return [];
      
      const { data } = await supabase
        .from("peticoes")
        .select("documento")
        .eq("area", filters.area)
        .order("documento");
      
      // Extract potential sub-areas from the documento field (this is a workaround)
      const subAreaSet = new Set<string>();
      data?.forEach(item => {
        if (item.documento && item.documento.includes("-")) {
          const potentialSubArea = item.documento.split("-")[0].trim();
          if (potentialSubArea && potentialSubArea !== item.documento) {
            subAreaSet.add(potentialSubArea);
          }
        }
      });
      
      return Array.from(subAreaSet);
    },
    enabled: !!filters.area && filters.area !== "all",
    staleTime: 5 * 60 * 1000,
  });
  
  // Memoize filter reset function
  const clearAllFilters = useCallback(() => {
    setFilters({
      area: "",
      subArea: "",
      tipo: "",
      tags: [],
      search: ""
    });
  }, [setFilters]);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.area || filters.subArea || filters.tipo || filters.tags.length > 0 || filters.search;
  }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filtros</h3>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Área do Direito</label>
          <Select
            value={filters.area}
            onValueChange={(value) =>
              setFilters({ ...filters, area: value, subArea: "" })
            }
            disabled={isLoadingAreas}
          >
            <SelectTrigger className="w-full">
              {isLoadingAreas ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <SelectValue placeholder="Área do Direito" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              {areas?.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.area && (
            <Badge variant="outline" className="mt-1 gap-1 cursor-pointer" onClick={() => setFilters({...filters, area: ""})}>
              {filters.area === "all" ? "Todas as áreas" : filters.area} <X className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {filters.area && subAreas?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Subárea</label>
            <Select
              value={filters.subArea}
              onValueChange={(value) =>
                setFilters({ ...filters, subArea: value })
              }
              disabled={isLoadingSubAreas}
            >
              <SelectTrigger>
                {isLoadingSubAreas ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Subárea" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as subáreas</SelectItem>
                {subAreas?.map((subArea) => (
                  <SelectItem key={subArea} value={subArea}>
                    {subArea}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filters.subArea && (
              <Badge variant="outline" className="mt-1 gap-1 cursor-pointer" onClick={() => setFilters({...filters, subArea: ""})}>
                {filters.subArea === "all" ? "Todas as subáreas" : filters.subArea} <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Petição</label>
          <Select
            value={filters.tipo}
            onValueChange={(value) =>
              setFilters({ ...filters, tipo: value })
            }
            disabled={isLoadingTipos}
          >
            <SelectTrigger>
              {isLoadingTipos ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <SelectValue placeholder="Tipo de Petição" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tipos?.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.tipo && (
            <Badge variant="outline" className="mt-1 gap-1 cursor-pointer" onClick={() => setFilters({...filters, tipo: ""})}>
              {filters.tipo === "all" ? "Todos os tipos" : filters.tipo} <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
