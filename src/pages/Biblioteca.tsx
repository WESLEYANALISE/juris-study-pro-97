
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Search, ArrowLeft, BookOpen, Download, Mic, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Layout from "@/components/Layout";
import { type ProfileType } from "@/components/WelcomeModal";

// Tipo para os itens da biblioteca
interface BibliotecaItem {
  id: number;
  livro: string;
  area: string;
  link: string;
  imagem: string;
  sobre: string;
  download: string;
}

const Biblioteca = () => {
  const navigate = useNavigate();
  const [livros, setLivros] = useState<BibliotecaItem[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<BibliotecaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"carousel" | "list">("carousel");
  const [selectedBook, setSelectedBook] = useState<BibliotecaItem | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [currentIframeUrl, setCurrentIframeUrl] = useState("");
  const [userProfile] = useState<ProfileType>(() => {
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });

  // Buscar livros do Supabase
  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const { data, error } = await supabase
          .from("biblioteca_juridica")
          .select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setLivros(data);
          setFilteredLivros(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da biblioteca:", error);
        toast.error("Não foi possível carregar a biblioteca. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivros();
  }, []);

  // Filtrar livros baseado na pesquisa
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLivros(livros);
    } else {
      const filtered = livros.filter(
        (livro) =>
          livro.livro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          livro.area?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLivros(filtered);
    }
  }, [searchTerm, livros]);

  const handleReadNow = (link: string) => {
    if (link) {
      setCurrentIframeUrl(link);
      setShowIframe(true);
    } else {
      toast.error("Link de leitura não disponível");
    }
  };

  const handleDownload = (downloadLink: string) => {
    if (downloadLink) {
      window.open(downloadLink, "_blank");
    } else {
      toast.error("Link de download não disponível");
    }
  };

  const handleNarration = (sobre: string) => {
    if (sobre) {
      // Implementação da narração (Text-to-Speech)
      const utterance = new SpeechSynthesisUtterance(sobre);
      utterance.lang = "pt-BR";
      speechSynthesis.speak(utterance);
      toast.success("Iniciando narração...");
    } else {
      toast.error("Nenhum conteúdo disponível para narração");
    }
  };

  // Recomendador de livros baseado em IA
  const handleAIHelp = () => {
    // Mostrar diálogo para o usuário inserir o assunto
    const assunto = prompt("Qual assunto você deseja estudar?");
    
    if (!assunto) return;
    
    // Simples mecanismo de recomendação baseado em palavras-chave
    const keywords: Record<string, string[]> = {
      "penal": ["crime", "pena", "criminal", "delito", "prisão"],
      "civil": ["contrato", "dano", "responsabilidade", "obrigação", "família"],
      "constitucional": ["constituição", "direitos fundamentais", "estado", "poder", "república"],
      "administrativo": ["administração", "servidor", "público", "licitação", "improbidade"],
      "trabalho": ["emprego", "trabalhista", "jornada", "salário", "férias"]
    };
    
    let areaRecomendada = "";
    const assuntoLower = assunto.toLowerCase();
    
    for (const [area, termos] of Object.entries(keywords)) {
      if (termos.some(termo => assuntoLower.includes(termo)) || assuntoLower.includes(area)) {
        areaRecomendada = area;
        break;
      }
    }
    
    if (!areaRecomendada) {
      // Fallback para uma busca simples
      areaRecomendada = assuntoLower;
    }
    
    // Filtrar livros da área recomendada
    const recomendacoes = livros.filter(
      livro => livro.area?.toLowerCase().includes(areaRecomendada) || 
               livro.livro?.toLowerCase().includes(assuntoLower)
    );
    
    if (recomendacoes.length > 0) {
      setFilteredLivros(recomendacoes);
      toast.success(`Encontramos ${recomendacoes.length} livros sobre "${assunto}"`);
    } else {
      toast.info("Não encontramos livros específicos para este assunto. Mostrando todos os livros.");
      setFilteredLivros(livros);
    }
  };

  if (showIframe) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="p-2 bg-background shadow-md">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowIframe(false)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <iframe 
          src={currentIframeUrl} 
          className="flex-1 w-full" 
          title="Visualização de livro"
        />
      </div>
    );
  }

  return (
    <Layout userProfile={userProfile}>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            Biblioteca Jurídica
          </h1>
          
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar livros..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" onClick={() => setViewMode(viewMode === "carousel" ? "list" : "carousel")}>
              {viewMode === "carousel" ? "▶ Ver Lista" : "◀ Ver Carrossel"}
            </Button>
            
            <Button onClick={handleAIHelp}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Ajuda IA
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredLivros.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum livro encontrado</p>
          </div>
        ) : viewMode === "carousel" ? (
          <Carousel className="w-full py-4">
            <CarouselContent>
              {filteredLivros.map((livro) => (
                <CarouselItem key={livro.id} className="md:basis-1/3 lg:basis-1/4">
                  <div className="p-1 h-full">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="flex flex-col items-center justify-center p-4">
                            <div className="h-48 w-36 overflow-hidden rounded mb-4">
                              {livro.imagem ? (
                                <img 
                                  src={livro.imagem} 
                                  alt={livro.livro || "Capa do livro"} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium text-center line-clamp-2 h-12">
                              {livro.livro || "Título não disponível"}
                            </h3>
                          </CardContent>
                          <CardFooter className="px-4 pb-4 pt-0 flex justify-center">
                            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                              {livro.area || "Área não especificada"}
                            </span>
                          </CardFooter>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{livro.livro}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-48 w-36 overflow-hidden rounded mb-4">
                              {livro.imagem ? (
                                <img 
                                  src={livro.imagem} 
                                  alt={livro.livro || "Capa do livro"} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm">{livro.sobre || "Sinopse não disponível."}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button onClick={() => handleReadNow(livro.link || "")}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Ler Agora
                          </Button>
                          <Button variant="outline" onClick={() => handleDownload(livro.download || "")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button variant="secondary" onClick={() => handleNarration(livro.sobre || "")}>
                            <Mic className="mr-2 h-4 w-4" />
                            Narração
                          </Button>
                          <Button variant="secondary" onClick={() => navigate("/anotacoes")}>
                            <FileText className="mr-2 h-4 w-4" />
                            Anotações
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLivros.map((livro) => (
              <Dialog key={livro.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="flex p-4">
                      <div className="h-24 w-16 mr-3 flex-shrink-0 overflow-hidden rounded">
                        {livro.imagem ? (
                          <img 
                            src={livro.imagem} 
                            alt={livro.livro || "Capa do livro"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <h3 className="font-medium line-clamp-2">
                          {livro.livro || "Título não disponível"}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full w-fit">
                          {livro.area || "Área não especificada"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{livro.livro}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-48 w-36 overflow-hidden rounded mb-4">
                        {livro.imagem ? (
                          <img 
                            src={livro.imagem} 
                            alt={livro.livro || "Capa do livro"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm">{livro.sobre || "Sinopse não disponível."}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button onClick={() => handleReadNow(livro.link || "")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Ler Agora
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(livro.download || "")}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="secondary" onClick={() => handleNarration(livro.sobre || "")}>
                      <Mic className="mr-2 h-4 w-4" />
                      Narração
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/anotacoes")}>
                      <FileText className="mr-2 h-4 w-4" />
                      Anotações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Biblioteca;
