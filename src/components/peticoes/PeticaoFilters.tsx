
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export function PeticaoFilters({ filters, setFilters }: PeticaoFiltersProps) {
  const { data: areas } = useQuery({
    queryKey: ["peticoes-areas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("peticoes")
        .select("area")
        .order("area");
      
      return [...new Set(data?.map((item) => item.area))];
    },
  });

  const { data: tipos } = useQuery({
    queryKey: ["peticoes-tipos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("peticoes")
        .select("tipo")
        .order("tipo");
      
      return [...new Set(data?.map((item) => item.tipo))];
    },
  });

  // We need to modify this query since sub_area doesn't exist in the peticoes table
  // We'll use a dummy approach that extracts sub-areas from the tipo field for now
  const { data: subAreas } = useQuery({
    queryKey: ["peticoes-subareas", filters.area],
    queryFn: async () => {
      if (!filters.area || filters.area === "all") return [];
      
      const { data } = await supabase
        .from("peticoes")
        .select("tipo")
        .eq("area", filters.area)
        .order("tipo");
      
      // Extract potential sub-areas from the tipo field (this is a workaround)
      // In a real scenario, you might want to add a sub_area column to your peticoes table
      const subAreaSet = new Set<string>();
      data?.forEach(item => {
        if (item.tipo && item.tipo.includes("-")) {
          const potentialSubArea = item.tipo.split("-")[0].trim();
          if (potentialSubArea && potentialSubArea !== item.tipo) {
            subAreaSet.add(potentialSubArea);
          }
        }
      });
      
      return Array.from(subAreaSet);
    },
    enabled: !!filters.area && filters.area !== "all",
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Filtros</h3>
      
      <div className="space-y-4">
        <Select
          value={filters.area}
          onValueChange={(value) =>
            setFilters({ ...filters, area: value, subArea: "" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Área do Direito" />
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

        {filters.area && subAreas?.length ? (
          <Select
            value={filters.subArea}
            onValueChange={(value) =>
              setFilters({ ...filters, subArea: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Subárea" />
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
        ) : null}

        <Select
          value={filters.tipo}
          onValueChange={(value) =>
            setFilters({ ...filters, tipo: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Petição" />
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
      </div>
    </div>
  );
}
