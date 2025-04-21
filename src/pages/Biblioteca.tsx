
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Book, HelpCircle, ArrowLeft, Download, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "@/components/ui/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Interface para os livros
interface Livro {
  id: number;
  livro: string;
  area: string;
  link: string;
  imagem: string;
  sobre: string;
  download: string;
}

const Biblioteca = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<Livro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"carousel" | "list">("carousel");
  const [lendoLivro, setLendoLivro] = useState(false);
  const [livroAtual, setLivroAtual] = useState<Livro | null>(null);
  const [livroDetalhes, setLivroDetalhes] = useState<Livro | null>(null);
  const [assistenteAberto, setAssistenteAberto] = useState(false);
  const [assuntoIA, setAssuntoIA] = useState("");
  const [sugestoesIA, setSugestoesIA] = useState<Livro[]>([]);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [areaFiltrada, setAreaFiltrada] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

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
          
          // Extrair áreas únicas
          const uniqueAreas = [...new Set(data.map(livro => livro.area))];
          setAreas(uniqueAreas);
        }
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        toast({
          title: "Erro ao carregar biblioteca",
          description: "Não foi possível carregar os livros. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };

    fetchLivros();
  }, []);

  // Filtrar livros conforme pesquisa
  useEffect(() => {
    const results = livros.filter(
      (livro) => 
        livro.livro.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (areaFiltrada === "" || livro.area === areaFiltrada)
    );
    setFilteredLivros(results);
  }, [searchTerm, livros, areaFiltrada]);

  // Função para recomendar livros com IA
  const recomendarLivros = async () => {
    if (!assuntoIA.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, informe um assunto para receber recomendações.",
        variant: "destructive",
      });
      return;
    }

    setCarregandoIA(true);
    
    try {
      // Simples algoritmo de recomendação baseado em palavras-chave
      // Em uma implementação real, seria usado um endpoint de IA
      const palavrasChave = assuntoIA.toLowerCase().split(" ");
      
      const livrosRecomendados = livros.filter(livro => 
        palavrasChave.some(palavra => 
          livro.area.toLowerCase().includes(palavra) || 
          livro.livro.toLowerCase().includes(palavra) ||
          (livro.sobre && livro.sobre.toLowerCase().includes(palavra))
        )
      );
      
      // Ordenando por relevância (quantidade de palavras-chave encontradas)
      const livrosOrdenados = livrosRecomendados.sort((a, b) => {
        const matchesA = palavrasChave.filter(palavra => 
          a.area.toLowerCase().includes(palavra) || 
          a.livro.toLowerCase().includes(palavra) ||
          (a.sobre && a.sobre.toLowerCase().includes(palavra))
        ).length;
        
        const matchesB = palavrasChave.filter(palavra => 
          b.area.toLowerCase().includes(palavra) || 
          b.livro.toLowerCase().includes(palavra) ||
          (b.sobre && b.sobre.toLowerCase().includes(palavra))
        ).length;
        
        return matchesB - matchesA;
      });
      
      setSugestoesIA(livrosOrdenados.slice(0, 5));
      
      if (livrosOrdenados.length === 0) {
        toast({
          title: "Sem recomendações",
          description: "Não encontramos livros relacionados a esse assunto. Tente termos mais específicos do Direito.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar recomendações:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar as recomendações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCarregandoIA(false);
    }
  };

  // Função para abrir o livro em iframe
  const abrirLivro = (livro: Livro) => {
    setLivroAtual(livro);
    setLendoLivro(true);
  };

  // Função para fechar o iframe
  const fecharLivro = () => {
    setLendoLivro(false);
    setLivroAtual(null);
  };

  // Função para exibir detalhes do livro
  const verDetalhes = (livro: Livro) => {
    setLivroDetalhes(livro);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Modo de leitura */}
      {lendoLivro && livroAtual && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-card shadow-md">
            <Button
              variant="outline"
              size="icon"
              onClick={fecharLivro}
              className="hover:bg-primary/20"
            >
              <ArrowLeft />
            </Button>
            <h2 className="text-xl font-semibold truncate">{livroAtual.livro}</h2>
            <div className="w-8"></div> {/* Espaçador para centralizar o título */}
          </div>
          <div className="flex-grow relative">
            <iframe
              ref={iframeRef}
              src={livroAtual.link}
              className="w-full h-full border-none"
              title={livroAtual.livro}
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {!lendoLivro && (
        <>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">Biblioteca Jurídica</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <Input
                  type="text"
                  placeholder="Pesquisar livros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <select 
                  className="px-3 py-2 rounded-md border bg-background"
                  value={areaFiltrada}
                  onChange={(e) => setAreaFiltrada(e.target.value)}
                >
                  <option value="">Todas as áreas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                
                <Button 
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "carousel" ? "list" : "carousel")}
                >
                  {viewMode === "carousel" ? "Ver Lista" : "Ver Carrossel"}
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Ajuda IA
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-medium">Recomendação de Livros</h3>
                      <p className="text-sm text-muted-foreground">
                        Informe o assunto que deseja estudar e a IA recomendará livros da biblioteca.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="Ex: Direito Penal, Contratos..."
                          value={assuntoIA}
                          onChange={(e) => setAssuntoIA(e.target.value)}
                        />
                        <Button 
                          onClick={recomendarLivros}
                          disabled={carregandoIA}
                        >
                          {carregandoIA ? "Processando..." : "Recomendar"}
                        </Button>
                      </div>
                      
                      {sugestoesIA.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Livros recomendados:</h4>
                          <ul className="space-y-2">
                            {sugestoesIA.map((livro) => (
                              <li 
                                key={livro.id}
                                className="text-sm border-l-2 border-primary pl-2 py-1 hover:bg-muted cursor-pointer"
                                onClick={() => verDetalhes(livro)}
                              >
                                {livro.livro} <span className="text-xs text-muted-foreground">({livro.area})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </header>

          {/* Exibição em Carrossel */}
          {viewMode === "carousel" && (
            <Carousel className="max-w-6xl mx-auto">
              <CarouselContent>
                {filteredLivros.map((livro) => (
                  <CarouselItem key={livro.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <div 
                      className="p-1 h-full cursor-pointer"
                      onClick={() => verDetalhes(livro)}
                    >
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                        <div className="relative pt-[140%] overflow-hidden rounded-t-lg bg-muted">
                          {livro.imagem ? (
                            <img
                              src={livro.imagem}
                              alt={livro.livro}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                              <Book className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-grow flex flex-col p-3">
                          <h3 className="font-medium text-sm line-clamp-2">{livro.livro}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{livro.area}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          )}

          {/* Exibição em Lista */}
          {viewMode === "list" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredLivros.map((livro) => (
                <Card 
                  key={livro.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => verDetalhes(livro)}
                >
                  <div className="relative pt-[60%] overflow-hidden rounded-t-lg bg-muted">
                    {livro.imagem ? (
                      <img
                        src={livro.imagem}
                        alt={livro.livro}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                        <Book className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-2">{livro.livro}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{livro.area}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Dialog de detalhes do livro */}
          <Dialog open={!!livroDetalhes} onOpenChange={(open) => !open && setLivroDetalhes(null)}>
            <DialogContent className="sm:max-w-2xl">
              {livroDetalhes && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{livroDetalhes.livro}</DialogTitle>
                    <DialogDescription>{livroDetalhes.area}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-4">
                    <div className="relative h-[250px] md:h-[300px] overflow-hidden rounded-lg bg-muted">
                      {livroDetalhes.imagem ? (
                        <img
                          src={livroDetalhes.imagem}
                          alt={livroDetalhes.livro}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                          <Book className="h-20 w-20 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Sinopse</h3>
                      <p className="text-sm text-muted-foreground">
                        {livroDetalhes.sobre || "Sinopse não disponível para este título."}
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter className="flex-wrap gap-2">
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setLivroDetalhes(null);
                          toast({
                            title: "Funcionalidade em desenvolvimento",
                            description: "A narração será implementada em breve.",
                          });
                        }}
                      >
                        Narração
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setLivroDetalhes(null);
                          navigate("/anotacoes");
                        }}
                      >
                        Anotações
                      </Button>
                      
                      {livroDetalhes.download && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(livroDetalhes.download, "_blank")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      
                      {livroDetalhes.link && (
                        <Button
                          onClick={() => {
                            setLivroDetalhes(null);
                            abrirLivro(livroDetalhes);
                          }}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Ler Agora
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Biblioteca;
