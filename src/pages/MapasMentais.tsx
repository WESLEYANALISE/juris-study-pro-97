
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { PageTransition } from "@/components/PageTransition";
import { MapaMentalCard } from "@/components/mapas-mentais/MapaMentalCard";
import { MapaMentalViewer } from "@/components/mapas-mentais/MapaMentalViewer";
import { MapaMentalFilter } from "@/components/mapas-mentais/MapaMentalFilter";
import { MapaMentalAIForm } from "@/components/mapas-mentais/MapaMentalAIForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid, List, Plus, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MapaMental {
  id: number;
  area: string;
  mapa: string;
  link: string;
  created_at: string;
}

export default function MapasMentais() {
  const [viewingMapa, setViewingMapa] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: mapas, isLoading } = useQuery({
    queryKey: ["mapas_mentais", selectedArea],
    queryFn: async () => {
      let query = supabase.from("mapas_mentais").select("*");
      
      if (selectedArea) {
        query = query.eq("area", selectedArea);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MapaMental[];
    },
  });

  const filteredMapas = mapas?.filter(mapa => 
    mapa.mapa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapa.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAreas = () => {
    const areas = mapas?.map(mapa => mapa.area).filter(Boolean);
    return [...new Set(areas)];
  };

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        {viewingMapa ? (
          <MapaMentalViewer 
            url={viewingMapa} 
            onBack={() => setViewingMapa(null)} 
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto p-6 space-y-8"
          >
            <div className="flex flex-col space-y-2">
              <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold"
              >
                Mapas Mentais
              </motion.h1>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                Acesse mapas mentais de diversas áreas do direito para facilitar seus estudos
              </motion.p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar mapas mentais..."
                  className="pl-9 w-full md:w-80"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <MapaMentalFilter
                  areas={getAreas() || []}
                  selectedArea={selectedArea}
                  onAreaSelect={setSelectedArea}
                />
                
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Mapa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Gerar Mapa Mental com IA
                      </DialogTitle>
                    </DialogHeader>
                    <MapaMentalAIForm 
                      areas={getAreas() || []}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {isLoading ? (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1"} gap-4`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-60 bg-muted/20 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-4`}>
                {filteredMapas?.map((mapa) => (
                  <MapaMentalCard
                    key={mapa.id}
                    mapa={mapa}
                    onView={() => setViewingMapa(mapa.link)}
                    viewType={viewMode}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
