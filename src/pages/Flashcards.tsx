
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  Filter,
  X,
  MoreHorizontal
} from "lucide-react";
import { FlashcardView } from "@/components/flashcards/FlashcardView";
import { StudyStats } from "@/components/flashcards/StudyStats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FlashCard = {
  id: string | number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
};

type ViewMode = "manual" | "auto";

export default function Flashcards() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("flash_cards").select("*");
      if (error) throw error;
      return (data ?? []) as FlashCard[];
    },
  });

  // Temas disponíveis e seleção
  const temas = useMemo(() => {
    if (!cards) return [];
    return Array.from(new Set(cards.map((c) => c.tema)));
  }, [cards]);
  
  const areas = useMemo(() => {
    if (!cards) return [];
    return Array.from(new Set(cards.map((c) => c.area)));
  }, [cards]);
  
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showDueOnly, setShowDueOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const filtered = useMemo(() => {
    if (!cards) return [];
    
    let filteredCards = cards;
    
    if (selectedArea) {
      filteredCards = filteredCards.filter(c => c.area === selectedArea);
    }
    
    if (selectedTemas.length > 0) {
      filteredCards = filteredCards.filter(c => selectedTemas.includes(c.tema));
    }
    
    return filteredCards.length > 0 ? filteredCards : cards.slice(0, 12);
  }, [cards, selectedTemas, selectedArea]);

  // Exibição manual/automática
  const [viewMode, setViewMode] = useState<ViewMode>("manual");
  const [index, setIndex] = useState(0);
  const [autoSpeed, setAutoSpeed] = useState(3500); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (viewMode === "auto" && filtered.length > 1) {
      intervalRef.current = setInterval(
        () => {
          setIsFlipped(false);
          setTimeout(() => {
            setIndex((i) => (i + 1) % filtered.length);
          }, 300);
        },
        autoSpeed
      );
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [viewMode, filtered.length, autoSpeed]);

  useEffect(() => {
    setIndex(0); // sempre reinicia na seleção/tema/mode novo
    setIsFlipped(false);
  }, [selectedTemas, selectedArea, viewMode, filtered.length]);

  // Função para lidar com a seleção de temas (múltiplos)
  const handleTemaSelect = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema) 
        : [...prev, tema]
    );
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % filtered.length);
    }, 200);
  };
  
  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i - 1 + filtered.length) % filtered.length);
    }, 200);
  };
  
  const handleRandom = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex(Math.floor(Math.random() * filtered.length));
    }, 200);
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 w-full pb-28 md:pb-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-between">
        <span>Flashcards</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          {showFilters ? <X className="h-4 w-4 mr-1" /> : <Filter className="h-4 w-4 mr-1" />}
          {showFilters ? 'Ocultar filtros' : 'Filtros'}
        </Button>
      </h1>

      <Card className={`p-4 mb-6 shadow-sm transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <StudyStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Área</label>
            <Select
              value={selectedArea || "all"}
              onValueChange={(value) => setSelectedArea(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Modo de Estudo</label>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "manual" ? "default" : "outline"}
                onClick={() => setViewMode("manual")}
                size="sm"
                className="flex-1"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Manual
              </Button>
              <Button
                variant={viewMode === "auto" ? "default" : "outline"}
                onClick={() => setViewMode("auto")}
                size="sm"
                className="flex-1"
              >
                {viewMode === "auto" ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                Automático
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Temas</label>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedTemas(temas)}>
                  Selecionar todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTemas([])}>
                  Limpar seleção
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between text-left font-normal"
                size="lg"
              >
                {selectedTemas.length === 0 ? (
                  <span className="text-muted-foreground">Selecione temas...</span>
                ) : (
                  <span>
                    {selectedTemas.length} {selectedTemas.length === 1 ? 'tema selecionado' : 'temas selecionados'}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2 max-h-[300px] overflow-y-auto" align="start">
              <div className="flex flex-wrap gap-2">
                {temas.map((tema) => (
                  <Badge 
                    key={tema}
                    variant={selectedTemas.includes(tema) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTemaSelect(tema)}
                  >
                    {tema}
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {viewMode === "auto" && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm">Velocidade:</span>
            <Select
              value={String(autoSpeed)}
              onValueChange={(value) => setAutoSpeed(Number(value))}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2000">Rápida</SelectItem>
                <SelectItem value="3500">Média</SelectItem>
                <SelectItem value="5000">Lenta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-muted-foreground">Carregando flashcards...</span>
        </div>
      ) : (
        <div className="relative min-h-[500px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            {filtered.length > 0 && (
              <motion.div
                key={filtered[index]?.id + '-card'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                <FlashcardView 
                  flashcard={filtered[index]} 
                  index={index} 
                  total={filtered.length}
                  onNext={handleNext}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {viewMode === "manual" && filtered.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <Button
                size="lg"
                variant="outline"
                onClick={handlePrevious}
                className="px-6 py-6 text-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                onClick={handleRandom}
                size="lg"
                className="px-6 py-6"
              >
                <RotateCcw className="h-5 w-5 mr-2" /> Aleatório
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleNext}
                className="px-6 py-6 text-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {filtered.length === 0 && !isLoading && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhum flashcard disponível com os filtros selecionados.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedArea(null);
              setSelectedTemas([]);
            }}
            className="mt-4"
          >
            Limpar filtros
          </Button>
        </Card>
      )}
      
      <Card className="mt-6 p-4 border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Dica de Estudo</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Avalie seu conhecimento após responder cada cartão para otimizar suas revisões futuras com o sistema de Repetição Espaçada.
        </p>
      </Card>
    </div>
  );
}
