
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashcardHeader } from "./FlashcardHeader";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { PlayCircle, Book, ListFilter, Clock } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";

interface FlashcardSetupProps {
  areas: { area: string; count: number }[];
  temas: { area: string; tema: string; count: number }[];
  onStartSession: (area: string, tema: string, count: number) => void;
  isMobile: boolean;
  loading: boolean;
}

export function FlashcardSetup({ 
  areas, 
  temas, 
  onStartSession, 
  isMobile, 
  loading 
}: FlashcardSetupProps) {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedTema, setSelectedTema] = useState("");
  const [cardCount, setCardCount] = useState(10);
  
  // Filter temas based on selected area
  const filteredTemas = temas.filter(
    (tema) => !selectedArea || tema.area === selectedArea
  );
  
  // Reset tema selection when area changes
  useEffect(() => {
    setSelectedTema("");
  }, [selectedArea]);

  // Count available cards for the current selection
  const availableCardCount = filteredTemas
    .filter(tema => !selectedTema || tema.tema === selectedTema)
    .reduce((acc, tema) => acc + tema.count, 0);

  // Calculate maximum cards we can use
  const maxCards = Math.min(availableCardCount, 50);

  // Adjust card count if it exceeds available cards
  useEffect(() => {
    if (cardCount > maxCards) {
      setCardCount(maxCards);
    }
  }, [selectedArea, selectedTema, maxCards]);

  const handleCardCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setCardCount(Math.min(count, maxCards));
    }
  };

  const handleStartSession = () => {
    onStartSession(selectedArea, selectedTema, cardCount);
  };

  const userStats = {
    totalStudied: 120,
    todayStudied: 25,
    masteredCards: 50,
    streak: 3,
  };

  return (
    <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
      <FlashcardHeader 
        userStats={userStats}
        onShowStats={() => {}}
        isMobile={isMobile}
      />
      
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Flashcards</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Configuração</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Escolha uma área para estudar
              </h2>
              
              <div className="space-y-4">
                <Select 
                  value={selectedArea} 
                  onValueChange={setSelectedArea}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma área do Direito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.area} value={area.area}>
                        {area.area} ({area.count} cartões)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ListFilter className="h-5 w-5 text-primary" />
                Escolha um tema específico
              </h2>
              
              <Select 
                value={selectedTema} 
                onValueChange={setSelectedTema}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os temas</SelectItem>
                  {filteredTemas
                    .filter((t, i, self) => 
                      i === self.findIndex(s => s.tema === t.tema))
                    .map((tema) => (
                      <SelectItem key={tema.tema} value={tema.tema}>
                        {tema.tema}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quantidade de cartões
              </h2>
              
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={maxCards}
                  value={cardCount}
                  onChange={(e) => handleCardCountChange(e.target.value)}
                  className="w-24"
                  disabled={loading || maxCards === 0}
                />
                
                <div className="text-sm text-muted-foreground">
                  {maxCards > 0 
                    ? `Máximo disponível: ${maxCards} cartões`
                    : "Nenhum cartão disponível com os filtros selecionados"}
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="pt-4 flex justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleStartSession} 
              disabled={loading || maxCards === 0 || cardCount <= 0}
              size="lg"
              className="gap-2 w-full max-w-md"
            >
              <PlayCircle className="h-5 w-5" />
              Iniciar sessão de estudo ({cardCount} cartões)
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
