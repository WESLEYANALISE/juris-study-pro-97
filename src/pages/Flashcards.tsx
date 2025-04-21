
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Brain, ArrowLeft, ArrowRight, Play, Pause, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { type ProfileType } from "@/components/WelcomeModal";

// Tipo para os flashcards
interface Flashcard {
  id: number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao?: string;
}

const Flashcards = () => {
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [temas, setTemas] = useState<string[]>([]);
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5); // segundos
  const [userProfile] = useState<ProfileType>(() => {
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });

  // Buscar flashcards do Supabase
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const { data, error } = await supabase
          .from("flash_cards")
          .select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setAllFlashcards(data);
          
          // Extrair temas e áreas únicos
          const uniqueTemas = Array.from(new Set(data.map(card => card.tema))).filter(Boolean) as string[];
          const uniqueAreas = Array.from(new Set(data.map(card => card.area))).filter(Boolean) as string[];
          
          setTemas(uniqueTemas);
          setAreas(uniqueAreas);
          
          // Inicialmente, selecionar todos os temas
          setSelectedTemas(uniqueTemas);
          setSelectedAreas(uniqueAreas);
          
          // Filtrar flashcards com base nos temas selecionados
          setFlashcards(data);
        }
      } catch (error) {
        console.error("Erro ao buscar flashcards:", error);
        toast.error("Não foi possível carregar os flashcards. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  // Filtrar flashcards quando os temas ou áreas selecionados mudam
  useEffect(() => {
    const filtered = allFlashcards.filter(
      card => 
        (selectedTemas.includes(card.tema || "") || selectedTemas.length === 0) &&
        (selectedAreas.includes(card.area || "") || selectedAreas.length === 0)
    );
    
    setFlashcards(filtered);
    setCurrentIndex(0);
    setFlipped(false);
  }, [selectedTemas, selectedAreas, allFlashcards]);

  // Controle de autoplay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoPlay && flashcards.length > 0) {
      timer = setTimeout(() => {
        if (flipped) {
          handleNext();
        } else {
          setFlipped(true);
        }
      }, autoPlaySpeed * 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoPlay, currentIndex, flipped, flashcards.length, autoPlaySpeed]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Voltar ao início
    }
    setFlipped(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(flashcards.length - 1); // Ir para o último
    }
    setFlipped(false);
  };

  const toggleTema = (tema: string) => {
    if (selectedTemas.includes(tema)) {
      setSelectedTemas(prev => prev.filter(t => t !== tema));
    } else {
      setSelectedTemas(prev => [...prev, tema]);
    }
  };

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(prev => prev.filter(a => a !== area));
    } else {
      setSelectedAreas(prev => [...prev, area]);
    }
  };

  const selectAllTemas = () => {
    setSelectedTemas(temas);
  };

  const clearAllTemas = () => {
    setSelectedTemas([]);
  };

  const selectAllAreas = () => {
    setSelectedAreas(areas);
  };

  const clearAllAreas = () => {
    setSelectedAreas([]);
  };

  const toggleAutoPlay = () => {
    setAutoPlay(prev => !prev);
  };

  if (isLoading) {
    return (
      <Layout userProfile={userProfile}>
        <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userProfile={userProfile}>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            Flashcards
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Selecionar Temas ({selectedTemas.length}/{temas.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Selecione os Temas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" onClick={selectAllTemas}>Selecionar Todos</Button>
                    <Button size="sm" variant="outline" onClick={clearAllTemas}>Limpar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {temas.map((tema) => (
                      <Badge 
                        key={tema}
                        variant={selectedTemas.includes(tema) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTema(tema)}
                      >
                        {tema}
                      </Badge>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Selecionar Áreas ({selectedAreas.length}/{areas.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Selecione as Áreas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" onClick={selectAllAreas}>Selecionar Todas</Button>
                    <Button size="sm" variant="outline" onClick={clearAllAreas}>Limpar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area) => (
                      <Badge 
                        key={area}
                        variant={selectedAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArea(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-play" 
                checked={autoPlay}
                onCheckedChange={toggleAutoPlay}
              />
              <Label htmlFor="auto-play">Auto ({autoPlaySpeed}s)</Label>
            </div>
            
            {autoPlay && (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setAutoPlaySpeed(prev => Math.max(2, prev - 1))}
                  disabled={autoPlaySpeed <= 2}
                >-</Button>
                <span>{autoPlaySpeed}s</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setAutoPlaySpeed(prev => Math.min(10, prev + 1))}
                  disabled={autoPlaySpeed >= 10}
                >+</Button>
              </div>
            )}
            
            {autoPlay ? (
              <Button size="icon" variant="outline" onClick={toggleAutoPlay}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="icon" variant="outline" onClick={toggleAutoPlay}>
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {flashcards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum flashcard encontrado para os critérios selecionados</p>
            <Button onClick={selectAllTemas}>Mostrar Todos os Temas</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center my-8">
            <div className="mb-4 text-sm text-muted-foreground">
              Card {currentIndex + 1} de {flashcards.length}
            </div>
            
            <div 
              className={`w-full max-w-2xl perspective-1000 ${flipped ? "animate-fade-in" : ""}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className={`relative bg-card p-6 rounded-lg shadow-lg transform transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
                <Card className={`w-full min-h-[300px] cursor-pointer overflow-hidden transition-all duration-300 ease-in-out ${flipped ? "bg-primary/5" : ""}`}>
                  <CardContent className="p-8 flex flex-col justify-between h-full">
                    {!flipped ? (
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <div className="text-xl font-semibold mb-4 text-primary">Pergunta:</div>
                        <div className="text-2xl">{flashcards[currentIndex].pergunta}</div>
                        <div className="mt-6 text-sm text-muted-foreground">Clique para ver a resposta</div>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <div className="text-xl font-semibold mb-4 text-green-500">Resposta:</div>
                        <div className="text-2xl">{flashcards[currentIndex].resposta}</div>
                        
                        {flashcards[currentIndex].explicacao && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-sm font-semibold mb-2">Explicação:</div>
                            <div className="text-sm">{flashcards[currentIndex].explicacao}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <Badge variant="secondary">
                    {flashcards[currentIndex].area || "Sem área"}
                  </Badge>
                  <Badge variant="outline">
                    {flashcards[currentIndex].tema || "Sem tema"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 gap-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
