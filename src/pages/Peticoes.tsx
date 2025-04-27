
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { PeticaoFilters } from "@/components/peticoes/PeticaoFilters";
import { PeticaoSearch } from "@/components/peticoes/PeticaoSearch";
import { PeticaoViewer } from "@/components/peticoes/PeticaoViewer";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

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

  const [viewingPeticao, setViewingPeticao] = useState<string | null>(null);

  const { data: peticoes, isLoading } = useQuery({
    queryKey: ["peticoes", filters],
    queryFn: async () => {
      let query = supabase.from("peticoes").select("*");

      if (filters.area && filters.area !== "all") {
        query = query.eq("area", filters.area);
      }
      if (filters.subArea && filters.subArea !== "all") {
        query = query.eq("sub_area", filters.subArea);
      }
      if (filters.tipo && filters.tipo !== "all") {
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
      <AnimatePresence mode="wait">
        {viewingPeticao ? (
          <PeticaoViewer 
            url={viewingPeticao} 
            onBack={() => setViewingPeticao(null)} 
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto p-6 space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <Card className="w-full md:w-64 p-4 sticky top-4 hover:shadow-hover transition-all">
                <PeticaoFilters filters={filters} setFilters={setFilters} />
              </Card>
              
              <div className="flex-1 space-y-6">
                <PeticaoSearch 
                  value={filters.search}
                  onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-64 bg-muted/20 animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {peticoes?.map((peticao) => (
                      <PeticaoCard 
                        key={peticao.id} 
                        peticao={peticao} 
                        onView={setViewingPeticao}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
