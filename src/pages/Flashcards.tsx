
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
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, BookOpen, Brain } from "lucide-react";

type FlashCard = {
  id: string;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
  dificuldade: string | null;
  tags: string[] | null;
  imagem_url: string | null;
};

type ViewMode = "manual" | "auto";

export default function Flashcards() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data } = await supabase.from("flash_cards_improved").select("*");
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

  useEffect(() => {
    if (viewMode === "auto" && filtered.length > 1) {
      intervalRef.current = setInterval(
        () => setIndex((i) => (i + 1) % filtered.length),
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
  }, [selectedTemas, selectedArea, viewMode, filtered.length]);

  // Função para lidar com a seleção de temas (múltiplos)
  const handleTemaSelect = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema) 
        : [...prev, tema]
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4 w-full">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Área</label>
            <Select
              value={selectedArea || ""}
              onValueChange={(value) => setSelectedArea(value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">Todas as áreas</SelectItem>
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
            <label className="text-sm font-medium mb-1 block">Temas</label>
            <div className="flex flex-wrap gap-2 p-1">
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
              {selectedTemas.length > 0 && (
                <Badge 
                  variant="secondary"
                  className="cursor-pointer ml-auto"
                  onClick={() => setSelectedTemas([])}
                >
                  Limpar seleção
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-b py-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "manual" ? "default" : "outline"}
              onClick={() => setViewMode("manual")}
              size="sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Manual
            </Button>
            <Button
              variant={viewMode === "auto" ? "default" : "outline"}
              onClick={() => setViewMode("auto")}
              size="sm"
            >
              {viewMode === "auto" ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              Automático
            </Button>
          </div>
          
          {viewMode === "auto" && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Velocidade:</span>
              <Select
                value={String(autoSpeed)}
                onValueChange={(value) => setAutoSpeed(Number(value))}
              >
                <SelectTrigger className="h-8 w-24">
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
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">Carregando cards…</div>
      ) : (
        <div className="relative min-h-[320px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            {filtered.length > 0 && (
              <motion.div
                key={filtered[index]?.id}
                initial={{ x: 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                <Card className="relative bg-gradient-to-t from-[#F1F0FB] via-[#9b87f519] to-card shadow-lg border-primary/30 rounded-xl overflow-hidden transition-all"
                  style={{
                    minHeight: 280,
                    boxShadow: "0 4px 40px #9b87f522"
                  }}
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    {filtered[index]?.dificuldade && (
                      <Badge variant={
                        filtered[index]?.dificuldade === 'fácil' ? "outline" :
                        filtered[index]?.dificuldade === 'médio' ? "secondary" : "destructive"
                      }>
                        {filtered[index]?.dificuldade}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-primary font-bold px-6 py-3 text-lg border-b flex items-center justify-between">
                    <div>
                      {filtered[index]?.tema} 
                      <span className="text-sm text-muted-foreground ml-2">({filtered[index]?.area})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-normal text-muted-foreground">Card {index + 1}/{filtered.length}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4 flex flex-col gap-4">
                    <div className="text-base font-semibold min-h-[48px]">{filtered[index]?.pergunta}</div>
                    <div className="text-sm bg-gradient-to-br from-[#D6BCFA44] to-[#FFF] py-2 px-4 rounded-lg text-gray-800 font-medium border">{filtered[index]?.resposta}</div>
                    
                    {filtered[index]?.explicacao && (
                      <div className="text-xs mt-2 text-muted-foreground p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Explicação:
                        </div>
                        {filtered[index]?.explicacao}
                      </div>
                    )}
                    
                    {filtered[index]?.tags && filtered[index]?.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filtered[index]?.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {viewMode === "manual" && filtered.length > 1 && (
            <div className="flex gap-4 mt-6">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIndex((i) => (i - 1 + filtered.length) % filtered.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setIndex(Math.floor(Math.random() * filtered.length))}
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Aleatório
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIndex((i) => (i + 1) % filtered.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum flashcard disponível com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
