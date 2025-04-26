import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SearchBar } from "@/components/biblioteca/SearchBar";
import { AIHelperDialog } from "@/components/biblioteca/AIHelperDialog";
import { BookCard } from "@/components/biblioteca/BookCard";
import { BookModal } from "@/components/biblioteca/BookModal";
import { BibliotecaStats } from "@/components/biblioteca/BibliotecaStats";
import { motion } from "framer-motion";
import type { Livro, BibliotecaStats as BibliotecaStatsType } from "@/types/biblioteca";

type State =
  | { mode: "carousel" }
  | { mode: "list" }
  | { mode: "reading"; livro: Livro }
  | { mode: "modal"; livro: Livro };

export default function Biblioteca() {
  const [state, setState] = useState<State>({ mode: "carousel" });
  const [searchTerm, setSearchTerm] = useState("");
  const [aiDialog, setAiDialog] = useState(false);
  const [aiResult, setAiResult] = useState<Livro[] | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
  const { data: livros, isLoading } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: async () => {
      const { data } = await supabase.from("biblioteca_juridica").select("*");
      return (data ?? []).map(book => ({
        ...book,
        id: String(book.id)
      })) as Livro[];
    }
  });

  const areas = useMemo(() => {
    if (!livros) return [];
    return Array.from(new Set(livros.map(l => l.area).filter(Boolean)));
  }, [livros]);

  const filteredLivros = useMemo(() => {
    if (!livros) return [];
    
    let filtered = livros;
    
    if (selectedArea) {
      filtered = filtered.filter(livro => livro.area === selectedArea);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(livro => 
        (livro.livro || "").toLowerCase().includes(searchLower) ||
        (livro.area || "").toLowerCase().includes(searchLower) ||
        (livro.sobre || "").toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [searchTerm, selectedArea, livros]);

  const livrosPorArea = useMemo(() => {
    if (!filteredLivros) return new Map<string, Livro[]>();
    
    const grouped = new Map<string, Livro[]>();
    
    filteredLivros.forEach(livro => {
      const area = livro.area || "Outra";
      if (!grouped.has(area)) {
        grouped.set(area, []);
      }
      grouped.get(area)!.push(livro);
    });
    
    return grouped;
  }, [filteredLivros]);
  
  const bibliotecaStats = useMemo((): BibliotecaStatsType => {
    const stats: BibliotecaStatsType = {
      total: livros?.length || 0,
      byArea: {}
    };
    
    if (!livros) return stats;
    
    livros.forEach(livro => {
      const area = livro.area || "Não categorizado";
      if (!stats.byArea[area]) {
        stats.byArea[area] = 0;
      }
      stats.byArea[area]++;
    });
    
    return stats;
  }, [livros]);

  async function handleAIHelp() {
    if (!livros) return;
    setAiResult(["buscando"] as any);
    
    const res = livros.filter(
      l =>
        (l.area ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.livro ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.sobre ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAiResult(res);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewChange={() => setState(state.mode === "carousel" ? { mode: "list" } : { mode: "carousel" })}
        isCarouselView={state.mode === "carousel"}
        onAIHelp={() => setAiDialog(true)}
        livrosSuggestions={livros}
      />
      
      {!isLoading && <BibliotecaStats stats={bibliotecaStats} />}
      
      <Tabs defaultValue="todas" className="mb-6">
        <TabsList className="mb-2 flex flex-wrap bg-[#1d1d1d] p-1">
          <TabsTrigger 
            value="todas" 
            onClick={() => setSelectedArea(null)}
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            Todas as áreas
          </TabsTrigger>
          {areas.map(area => (
            <TabsTrigger 
              key={area} 
              value={area}
              onClick={() => setSelectedArea(area)}
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              {area}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="text-center py-20 text-white/70">Carregando…</div>
      ) : state.mode === "carousel" ? (
        <div className="space-y-10">
          {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => (
            <motion.div 
              key={area} 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2 w-1 h-6 bg-red-600 inline-block"></span>
                {area} <span className="text-sm ml-2 text-white/60">({livrosArea.length} livros)</span>
              </h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {livrosArea.map(livro => (
                    <CarouselItem
                      key={livro.id}
                      className="pl-2 md:pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      <BookCard 
                        livro={livro} 
                        onCardClick={() => setState({ mode: "modal", livro })}
                        showFavoriteButton
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-[#1d1d1d] text-white border-[#333] hover:bg-red-600" />
                <CarouselNext className="bg-[#1d1d1d] text-white border-[#333] hover:bg-red-600" />
              </Carousel>
            </motion.div>
          ))}
        </div>
      ) : state.mode === "list" ? (
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => (
            <motion.div key={area} className="space-y-3" variants={itemVariants}>
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2 w-1 h-6 bg-red-600 inline-block"></span>
                {area} <span className="text-sm ml-2 text-white/60">({livrosArea.length} livros)</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {livrosArea.map(livro => (
                  <motion.div key={livro.id} variants={itemVariants}>
                    <BookCard 
                      livro={livro} 
                      onCardClick={() => setState({ mode: "modal", livro })}
                      showFavoriteButton
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : state.mode === "reading" ? (
        <div className="fixed inset-0 bg-[#0c0c0c] z-50">
          <iframe
            src={state.livro.link ?? ""}
            className="w-full h-full"
            title={state.livro.livro || "Leitura"}
            allowFullScreen
          />
          <Button
            variant="secondary"
            className="fixed top-4 left-4 z-60 shadow-lg bg-[#1d1d1d] border-[#333] text-white hover:bg-red-600"
            onClick={() => setState({ mode: "carousel" })}
          >
            Voltar
          </Button>
        </div>
      ) : null}

      {state.mode === "modal" && (
        <BookModal
          livro={state.livro}
          onClose={() => setState({ mode: "carousel" })}
          onRead={() => setState({ mode: "reading", livro: state.livro })}
        />
      )}

      <AIHelperDialog
        open={aiDialog}
        onOpenChange={setAiDialog}
        onSearch={handleAIHelp}
        results={aiResult}
        onSelectBook={(livro) => {
          setState({ mode: "modal", livro });
          setAiDialog(false);
        }}
      />
    </div>
  );
}
