import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookAudio, Download, FileText, ArrowRight, ArrowLeft, BookOpen, Search, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/biblioteca/BookCard";
import { BookModal } from "@/components/biblioteca/BookModal";

type Livro = {
  id: string;
  titulo: string;
  autor: string | null;
  editora: string | null;
  area: string;
  ano_publicacao: number | null;
  capa_url: string | null;
  sinopse: string | null;
  link_leitura: string | null;
  link_download: string | null;
  tags: string[] | null;
};

type State =
  | { mode: "carousel" }
  | { mode: "list" }
  | { mode: "reading"; livro: Livro }
  | { mode: "modal"; livro: Livro };

export default function Biblioteca() {
  const [state, setState] = useState<State>({ mode: "carousel" });
  const [searchTerm, setSearchTerm] = useState("");
  const [aiDialog, setAiDialog] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<Livro[] | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
  const { data: livros, isLoading } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: async () => {
      const { data } = await supabase.from("biblioteca_juridica_improved").select("*");
      return (data ?? []) as Livro[];
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
        (livro.titulo || "").toLowerCase().includes(searchLower) ||
        (livro.autor || "").toLowerCase().includes(searchLower) ||
        (livro.sinopse || "").toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [searchTerm, selectedArea, livros]);

  async function handleAIHelp() {
    if (!aiQuery.trim()) return;
    setAiResult(["buscando"] as any);
    
    if (livros) {
      const res = livros.filter(
        l =>
          (l.area ?? "").toLowerCase().includes(aiQuery.toLowerCase()) ||
          (l.titulo ?? "").toLowerCase().includes(aiQuery.toLowerCase()) ||
          (l.sinopse ?? "").toLowerCase().includes(aiQuery.toLowerCase()) ||
          (l.tags ?? []).some(tag => tag.toLowerCase().includes(aiQuery.toLowerCase()))
      );
      setAiResult(res);
    }
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar livro, autor ou tema..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setState(
                state.mode === "carousel" ? { mode: "list" } : { mode: "carousel" }
              )
            }
          >
            {state.mode === "carousel" ? (
              <>
                <ArrowRight className="mr-1" size={16} /> Ver Lista
              </>
            ) : (
              <>
                <ArrowLeft className="mr-1" size={16} /> Ver Carousel
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAiDialog(true)}>
            Ajuda IA
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="todas" className="mb-6">
        <TabsList className="mb-2 flex flex-wrap">
          <TabsTrigger value="todas" onClick={() => setSelectedArea(null)}>
            Todas as áreas
          </TabsTrigger>
          {areas.map(area => (
            <TabsTrigger 
              key={area} 
              value={area}
              onClick={() => setSelectedArea(area)}
            >
              {area}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="text-center py-20">Carregando…</div>
      ) : state.mode === "carousel" ? (
        <div className="space-y-10">
          {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => (
            <div key={area} className="space-y-3">
              <h2 className="text-xl font-semibold text-primary">{area}</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {livrosArea.map(livro => (
                    <CarouselItem
                      key={livro.id}
                      className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                      onClick={() => setState({ mode: "modal", livro })}
                    >
                      <BookCard livro={livro} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ))}
        </div>
      ) : state.mode === "list" ? (
        <div className="space-y-8">
          {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => (
            <div key={area} className="space-y-3">
              <h2 className="text-xl font-semibold text-primary">{area}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {livrosArea.map(livro => (
                  <div key={livro.id} onClick={() => setState({ mode: "modal", livro })}>
                    <BookCard livro={livro} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : state.mode === "reading" ? (
        <div className="fixed inset-0 bg-background z-50">
          <iframe
            src={state.livro.link_leitura ?? ""}
            className="w-full h-full"
            title={state.livro.titulo || "Leitura"}
            allowFullScreen
          />
          <Button
            variant="secondary"
            className="fixed top-4 left-4 z-60 shadow-lg"
            onClick={() => setState({ mode: "carousel" })}
          >
            <ArrowLeft className="mr-1" size={20} /> Voltar
          </Button>
        </div>
      ) : null}

      <AnimatePresence>
        {state.mode === "modal" && (
          <Dialog open onOpenChange={() => setState({ mode: "carousel" })}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden animate-fade-in" asChild>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg bg-card"
              >
                <BookModal
                  livro={state.livro}
                  onClose={() => setState({ mode: "carousel" })}
                  onRead={() => setState({ mode: "reading", livro: state.livro })}
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Dialog open={aiDialog} onOpenChange={setAiDialog}>
        <DialogContent className="max-w-md">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText size={18} /> Ajuda por IA
            </h3>
            <p className="text-sm mb-2">
              Descreva o tema/assunto que deseja estudar e a IA sugerirá livros relevantes.
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                value={aiQuery}
                type="text"
                className="flex-1"
                placeholder="Ex: Direito Penal, contrato, recursos..."
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => (e.key === "Enter" ? handleAIHelp() : undefined)}
              />
              <Button size="sm" onClick={handleAIHelp}>Buscar</Button>
            </div>
            <div>
              {aiResult === null ? null : aiResult === (["buscando"] as any) ? (
                <div className="text-center py-6 text-muted-foreground">Buscando sugestões…</div>
              ) : aiResult.length === 0 ? (
                <div className="text-center py-6 text-destructive">Nenhum livro encontrado.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {aiResult.map(lv => (
                    <div
                      key={lv.id}
                      className="flex items-center gap-3 cursor-pointer border rounded-lg p-2 hover:shadow bg-muted"
                      onClick={() => {
                        setState({ mode: "modal", livro: lv });
                        setAiDialog(false);
                      }}
                    >
                      {lv.capa_url ? (
                        <div className="h-16 w-12 flex-shrink-0 relative overflow-hidden rounded">
                          <img
                            src={lv.capa_url}
                            alt={lv.titulo}
                            className="h-full w-full object-cover absolute inset-0"
                          />
                          <div className="absolute inset-0 bg-black/70 flex items-end p-1">
                            <span className="text-[10px] text-white line-clamp-2 font-medium">{lv.titulo}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 w-12 bg-gray-800 rounded flex-shrink-0 flex items-end">
                          <div className="p-1 w-full">
                            <span className="text-[10px] text-white line-clamp-2 font-medium">{lv.titulo}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm">{lv.titulo}</div>
                        <div className="text-xs text-muted-foreground">{lv.area}</div>
                        {lv.autor && (
                          <div className="text-xs flex items-center gap-1 mt-1">
                            <User2 size={10} /> {lv.autor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
