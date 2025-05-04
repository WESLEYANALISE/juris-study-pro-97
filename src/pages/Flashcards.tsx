
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FlashcardSetup } from "@/components/flashcards/FlashcardSetup";
import { FlashcardSession } from "@/components/flashcards/FlashcardSession";
import { FlashcardExtendedStats } from "@/components/flashcards/FlashcardExtendedStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { Brain, Info } from "lucide-react";

type FlashCard = {
  id: string | number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
};

export default function Flashcards() {
  const [studyConfig, setStudyConfig] = useState<{
    selectedTemas: string[];
    selectedArea: string | null;
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    cardCount: number;
  } | null>(null);
  
  const [filteredCards, setFilteredCards] = useState<FlashCard[]>([]);
  const [showStats, setShowStats] = useState(false);
  const isMobile = useIsMobile();

  // Fetch all available flashcards
  const { data: allCards, isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_cards_improved")
        .select("*");
      
      if (error) throw error;
      return (data ?? []) as FlashCard[];
    },
  });

  // Filter cards when configuration changes
  useEffect(() => {
    if (!studyConfig || !allCards) return;
    
    let filtered = [...allCards];
    
    // Apply area filter
    if (studyConfig.selectedArea) {
      filtered = filtered.filter(card => card.area === studyConfig.selectedArea);
    }
    
    // Apply tema filter
    if (studyConfig.selectedTemas.length > 0) {
      filtered = filtered.filter(card => studyConfig.selectedTemas.includes(card.tema));
    }
    
    // Limit to selected count
    filtered = filtered.slice(0, studyConfig.cardCount);
    
    // Randomize order
    filtered = filtered.sort(() => Math.random() - 0.5);
    
    setFilteredCards(filtered);
  }, [studyConfig, allCards]);

  // Handle study session start
  const handleStartStudy = (config: {
    selectedTemas: string[];
    selectedArea: string | null;
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    cardCount: number;
  }) => {
    setStudyConfig(config);
  };

  // Back to setup
  const handleExit = () => {
    setStudyConfig(null);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-28 md:pb-6">
      {/* Header with stats toggle on desktop */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Flashcards
        </h1>
        
        {!isMobile && !studyConfig && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Info className="h-4 w-4" />
            {showStats ? "Ocultar estatísticas" : "Ver estatísticas"}
          </button>
        )}
      </div>
      
      {/* Stats and Setup layout */}
      {!studyConfig && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* On mobile, show stats toggle and drawer */}
          <div className="md:col-span-2">
            <FlashcardSetup onStartStudy={handleStartStudy} />
          </div>
          
          {/* Stats on desktop */}
          {!isMobile && showStats && (
            <div className="md:col-span-1">
              <FlashcardExtendedStats onClose={() => setShowStats(false)} />
            </div>
          )}
        </div>
      )}

      {/* Study session */}
      {studyConfig && (
        <FlashcardSession
          cards={filteredCards}
          showAnswers={studyConfig.showAnswers}
          studyMode={studyConfig.studyMode}
          onExit={handleExit}
        />
      )}

      {/* Loading state */}
      {isLoading && !studyConfig && (
        <Card className="p-6 animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/4"></div>
        </Card>
      )}
    </div>
  );
}
