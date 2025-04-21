
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, CheckSquare, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Interface para os flashcards
interface Flashcard {
  id: number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
}

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [autoAvance, setAutoAvance] = useState(false);
  const [mostraResposta, setMostraResposta] = useState(false);
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>([]);
  const [temasDisponiveis, setTemasDisponiveis] = useState<string[]>([]);
  const [areasDisponiveis, setAreasDisponiveis] = useState<string[]>([]);
  const [areaSelecionada, setAreaSelecionada] = useState<string>("");
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [transicao, setTransicao] = useState(false);
  const [direcao, setDirecao] = useState<"next" | "prev">("next");

  // Carregar flashcards do Supabase
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
          setFlashcards(data);
          
          // Extrair áreas e temas únicos
          const areas = [...new Set(data.map(card => card.area))];
          setAreasDisponiveis(areas);
          
          if (areas.length > 0) {
            setAreaSelecionada(areas[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar flashcards:", error);
        toast({
          title: "Erro ao carregar flashcards",
          description: "Não foi possível carregar os flashcards. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };

    fetchFlashcards();
  }, []);

  // Atualizar temas disponíveis quando a área muda
  useEffect(() => {
    if (areaSelecionada) {
      const temas = [...new Set(
        flashcards
          .filter(card => card.area === areaSelecionada)
          .map(card => card.tema)
      )];
      setTemasDisponiveis(temas);
      setTemasSelecionados([]);
    }
  }, [areaSelecionada, flashcards]);

  // Filtrar flashcards quando os temas selecionados mudam
  useEffect(() => {
    let filtered = [...flashcards];
    
    if (areaSelecionada) {
      filtered = filtered.filter(card => card.area === areaSelecionada);
    }
    
    if (temasSelecionados.length > 0) {
      filtered = filtered.filter(card => temasSelecionados.includes(card.tema));
    }
    
    setFilteredCards(filtered);
    setCurrentCardIndex(0);
    setMostraResposta(false);
  }, [temasSelecionados, areaSelecionada, flashcards]);

  // Configurar o modo automático
  useEffect(() => {
    if (autoAvance && filteredCards.length > 0) {
      const id = window.setInterval(() => {
        proximoCard();
      }, 5000);
      setIntervalId(id);
    } else if (intervalId !== null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [autoAvance, filteredCards.length]);

  const toggleTema = (tema: string) => {
    if (temasSelecionados.includes(tema)) {
      setTemasSelecionados(temasSelecionados.filter(t => t !== tema));
    } else {
      setTemasSelecionados([...temasSelecionados, tema]);
    }
  };

  const proximoCard = () => {
    if (filteredCards.length === 0) return;
    
    setDirecao("next");
    setTransicao(true);
    setMostraResposta(false);
    
    // Usar setTimeout para esperar a animação de saída
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => 
        prevIndex === filteredCards.length - 1 ? 0 : prevIndex + 1
      );
      setTransicao(false);
    }, 300);
  };

  const anteriorCard = () => {
    if (filteredCards.length === 0) return;
    
    setDirecao("prev");
    setTransicao(true);
    setMostraResposta(false);
    
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => 
        prevIndex === 0 ? filteredCards.length - 1 : prevIndex - 1
      );
      setTransicao(false);
    }, 300);
  };

  // Obter o card atual
  const currentCard = filteredCards[currentCardIndex];

  // Classes para animação
  const cardAnimationClass = transicao 
    ? direcao === "next" 
      ? "animate-slide-out-right opacity-0" 
      : "animate-slide-out-left opacity-0"
    : "animate-fade-in";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Flashcards</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Personalize os flashcards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="area">Área do Direito</Label>
                <select
                  id="area"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={areaSelecionada}
                  onChange={(e) => setAreaSelecionada(e.target.value)}
                >
                  {areasDisponiveis.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Temas</Label>
                {temasDisponiveis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum tema disponível para a área selecionada.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {temasDisponiveis.map((tema) => (
                      <div key={tema} className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full justify-start ${
                            temasSelecionados.includes(tema) 
                              ? "bg-primary/20 border-primary" 
                              : ""
                          }`}
                          onClick={() => toggleTema(tema)}
                        >
                          {temasSelecionados.includes(tema) && <CheckSquare className="mr-2 h-4 w-4" />}
                          <span className="truncate">{tema}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-mode" 
                  checked={autoAvance}
                  onCheckedChange={setAutoAvance}
                />
                <Label htmlFor="auto-mode">Modo automático</Label>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            {filteredCards.length} flashcards disponíveis
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[500px] relative">
          {filteredCards.length === 0 ? (
            <Card className="w-full max-w-xl">
              <CardContent className="p-8 text-center space-y-4">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">Nenhum flashcard disponível</h3>
                <p className="text-muted-foreground">
                  Selecione uma área e pelo menos um tema para começar a estudar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div 
                className={`w-full max-w-2xl aspect-[3/2] perspective relative ${cardAnimationClass}`}
              >
                <div className={`w-full h-full relative card-flip ${mostraResposta ? 'card-flipped' : ''}`}>
                  {/* Face da pergunta */}
                  <Card 
                    className={`w-full h-full absolute inset-0 card-face flex flex-col ${!mostraResposta ? 'card-face-front' : 'card-face-back'}`}
                    onClick={() => setMostraResposta(true)}
                  >
                    <CardHeader className="bg-primary/10 rounded-t-lg">
                      <CardTitle className="text-center">Pergunta</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-8">
                      <p className="text-xl font-medium text-center">
                        {currentCard?.pergunta}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-center text-sm text-muted-foreground pb-4">
                      Clique para ver a resposta
                    </CardFooter>
                  </Card>
                  
                  {/* Face da resposta */}
                  <Card 
                    className={`w-full h-full absolute inset-0 card-face flex flex-col ${mostraResposta ? 'card-face-front' : 'card-face-back'}`}
                    onClick={() => setMostraResposta(false)}
                  >
                    <CardHeader className="bg-primary/10 rounded-t-lg">
                      <CardTitle className="text-center">Resposta</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-8">
                      <p className="text-xl font-medium text-center">
                        {currentCard?.resposta}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-center text-sm text-muted-foreground pb-4">
                      Clique para ver a pergunta
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-between w-full max-w-lg mt-8">
                <Button variant="outline" onClick={anteriorCard} disabled={filteredCards.length <= 1}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  {currentCardIndex + 1} de {filteredCards.length}
                </div>
                <Button variant="outline" onClick={proximoCard} disabled={filteredCards.length <= 1}>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
