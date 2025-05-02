
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
import { PDFViewer } from "@/components/biblioteca/PDFViewer";
import { EPUBViewer } from "@/components/biblioteca/EPUBViewer";
import { BibliotecaRecomendacoes } from "@/components/biblioteca/BibliotecaRecomendacoes";
import type { Livro } from "@/types/biblioteca";

type ViewerType = "pdf" | "epub";

type State = {
  mode: "carousel";
} | {
  mode: "list";
} | {
  mode: "reading";
  livro: Livro;
  viewerType: ViewerType;
} | {
  mode: "modal";
  livro: Livro;
};

export default function Biblioteca() {
  const [state, setState] = useState<State>({
    mode: "carousel"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [aiDialog, setAiDialog] = useState(false);
  const [aiResult, setAiResult] = useState<Livro[] | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"acervo" | "recomendacoes">("acervo");
  
  const {
    data: livros,
    isLoading
  } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("biblioteca_juridica").select("*");
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
      filtered = filtered.filter(livro => (livro.livro || "").toLowerCase().includes(searchLower) || (livro.area || "").toLowerCase().includes(searchLower) || (livro.sobre || "").toLowerCase().includes(searchLower));
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
  
  async function handleAIHelp() {
    if (!livros) return;
    setAiResult(["buscando"] as any);
    const res = livros.filter(l => (l.area ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || (l.livro ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || (l.sobre ?? "").toLowerCase().includes(searchTerm.toLowerCase()));
    setAiResult(res);
  }

  // Determine file type for reading mode
  const getFileType = (link: string | null): ViewerType => {
    if (!link) return "pdf";
    const extension = link.split('.').pop()?.toLowerCase();
    return extension === 'epub' ? 'epub' : 'pdf';
  };
  
  return <div className="max-w-6xl mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={val => setActiveTab(val as "acervo" | "recomendacoes")} className="w-full space-y-6">
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <TabsList className="inline-flex w-auto justify-start sm:justify-center gap-1 px-0 py-0 my-0 mx-0">
            <TabsTrigger value="acervo" className="flex-1">Acervo</TabsTrigger>
            <TabsTrigger value="recomendacoes" className="flex-1 px-[25px]">Recomendações</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="acervo" className="pb-20 md:pb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onViewChange={() => setState(state.mode === "carousel" ? {
          mode: "list"
        } : {
          mode: "carousel"
        })} isCarouselView={state.mode === "carousel"} onAIHelp={() => setAiDialog(true)} livrosSuggestions={livros} />
          
          <div className="overflow-x-auto pb-2 -mx-4 px-4 mb-6">
            <Tabs defaultValue="todas">
              <TabsList className="inline-flex min-w-full sm:min-w-0 w-auto justify-start sm:justify-center gap-1 flex-nowrap">
                <TabsTrigger value="todas" onClick={() => setSelectedArea(null)}>
                  Todas as áreas
                </TabsTrigger>
                {areas.map(area => <TabsTrigger key={area} value={area} onClick={() => setSelectedArea(area)}>
                    {area}
                  </TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
          
          {isLoading ? <div className="text-center py-20">Carregando…</div> : state.mode === "carousel" ? <div className="space-y-10">
              {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => <div key={area} className="space-y-3">
                  <h2 className="text-xl font-semibold text-primary">{area}</h2>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {livrosArea.map(livro => <CarouselItem key={livro.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                          <BookCard livro={livro} onCardClick={() => setState({
                    mode: "modal",
                    livro
                  })} />
                        </CarouselItem>)}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>)}
            </div> : state.mode === "list" ? <div className="space-y-8">
              {Array.from(livrosPorArea.entries()).map(([area, livrosArea]) => <div key={area} className="space-y-3">
                  <h2 className="text-xl font-semibold text-primary">{area}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {livrosArea.map(livro => <BookCard key={livro.id} livro={livro} onCardClick={() => setState({
                mode: "modal",
                livro
              })} />)}
                  </div>
                </div>)}
            </div> : state.mode === "reading" ? <div className="fixed inset-0 bg-background z-50">
              {state.viewerType === "epub" ? (
                <EPUBViewer 
                  livro={state.livro} 
                  onClose={() => setState({mode: "carousel"})} 
                />
              ) : (
                state.livro.link ? (
                  <PDFViewer 
                    livro={{
                      ...state.livro,
                      pdf: state.livro.link || '',
                    }}
                    onClose={() => setState({mode: "carousel"})}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md">
                      <h3 className="text-lg font-bold mb-2">Arquivo não disponível</h3>
                      <p>O link para este livro não está disponível.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setState({mode: "carousel"})}
                      >
                        Voltar
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div> : null}

          {state.mode === "modal" && <BookModal livro={state.livro} onClose={() => setState({
          mode: "carousel"
        })} onRead={(viewerType = "pdf") => setState({
          mode: "reading",
          livro: state.livro,
          viewerType
        })} />}

          <AIHelperDialog open={aiDialog} onOpenChange={setAiDialog} onSearch={handleAIHelp} results={aiResult} onSelectBook={livro => {
          setState({
            mode: "modal",
            livro
          });
          setAiDialog(false);
        }} />
        </TabsContent>
        
        <TabsContent value="recomendacoes" className="pb-20 md:pb-6">
          <BibliotecaRecomendacoes />
        </TabsContent>
      </Tabs>
    </div>;
}
