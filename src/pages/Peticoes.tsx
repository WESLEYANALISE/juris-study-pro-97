
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { PeticaoFilters } from "@/components/peticoes/PeticaoFilters";
import { PeticaoSearch } from "@/components/peticoes/PeticaoSearch";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";

interface FiltersState {
  area: string;
  subArea: string;
  tipo: string;
  tags: string[];
  search: string;
}

export default function Peticoes() {
  const [filters, setFilters] = useState<FiltersState>({
    area: "",
    subArea: "",
    tipo: "",
    tags: [],
    search: "",
  });

  const { data: peticoes, isLoading } = useQuery({
    queryKey: ["peticoes", filters],
    queryFn: async () => {
      let query = supabase.from("peticoes").select("*");

      if (filters.area) {
        query = query.eq("area", filters.area);
      }
      if (filters.subArea) {
        query = query.eq("sub_area", filters.subArea);
      }
      if (filters.tipo) {
        query = query.eq("tipo", filters.tipo);
      }
      if (filters.tags.length > 0) {
        query = query.contains("tags", filters.tags);
      }
      if (filters.search) {
        query = query.or(
          `descricao.ilike.%${filters.search}%,tipo.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <Card className="w-full md:w-64 p-4 sticky top-4">
            <PeticaoFilters filters={filters} setFilters={setFilters} />
          </Card>
          
          <div className="flex-1 space-y-6">
            <PeticaoSearch 
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div>Carregando...</div>
              ) : (
                peticoes?.map((peticao) => (
                  <PeticaoCard key={peticao.id} peticao={peticao} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
