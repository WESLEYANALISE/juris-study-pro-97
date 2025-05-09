import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FlashcardSetup } from "@/components/flashcards/FlashcardSetup";
import { FlashcardSession } from "@/components/flashcards/FlashcardSession";
import { FlashcardExtendedStats } from "@/components/flashcards/FlashcardExtendedStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { Brain, Info, Sparkles, Award, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    selectedAreas: string[];
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    autoNarrate: boolean;
    cardCount: number;
    spaceInterval: "normal" | "short" | "long";
  } | null>(null);
  const [filteredCards, setFilteredCards] = useState<FlashCard[]>([]);
  const [showStats, setShowStats] = useState(false);
  const isMobile = useIsMobile();

  // Fetch all available flashcards
  const {
    data: allCards,
    isLoading
  } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("flash_cards_improved").select("*");
      if (error) throw error;
      return (data ?? []) as FlashCard[];
    }
  });

  // Fetch user stats
  const {
    data: userStats
  } = useQuery({
    queryKey: ["flashcard-user-stats"],
    queryFn: async () => {
      // This would usually fetch from a real endpoint
      // Simulated data for now
      return {
        totalStudied: 157,
        todayStudied: 23,
        masteredCards: 47,
        streak: 5
      };
    }
  });

  // Filter cards when configuration changes
  useEffect(() => {
    if (!studyConfig || !allCards) return;
    let filtered = [...allCards];

    // Apply area filter
    if (studyConfig.selectedAreas.length > 0) {
      filtered = filtered.filter(card => studyConfig.selectedAreas.includes(card.area));
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
    selectedAreas: string[];
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    autoNarrate: boolean;
    cardCount: number;
    spaceInterval: "normal" | "short" | "long";
  }) => {
    setStudyConfig(config);
  };

  // Back to setup
  const handleExit = () => {
    setStudyConfig(null);
  };
  return <div className="container max-w-4xl mx-auto p-4 pb-28 md:pb-6">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-purple-900/20 to-transparent -z-10 pointer-events-none" />
      
      {/* Header with stats toggle */}
      <div className="flex justify-between items-center mb-6">
        <motion.div className="flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.3
      }}>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          
          {userStats && !studyConfig && <Badge variant="outline" className="ml-2 bg-primary/10 border-primary/20 text-muted-foreground">
              Sequência: {userStats.streak} dias
            </Badge>}
        </motion.div>
        
        {!isMobile && !studyConfig && <motion.button onClick={() => setShowStats(!showStats)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.3,
        delay: 0.1
      }} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
            <BarChart className="h-4 w-4" />
            {showStats ? "Ocultar estatísticas" : "Ver estatísticas"}
          </motion.button>}
      </div>
      
      {/* Quick stats row (when not in study session) */}
      {!studyConfig && userStats && <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3,
      delay: 0.1
    }}>
          <Card className="bg-gradient-to-br from-[#1A1633] to-[#262051] border border-primary/10 p-3 flex gap-3 items-center">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total estudado</p>
              <p className="text-lg font-semibold">{userStats.totalStudied}</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1A1633] to-[#262051] border border-primary/10 p-3 flex gap-3 items-center">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hoje</p>
              <p className="text-lg font-semibold">{userStats.todayStudied}</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1A1633] to-[#262051] border border-primary/10 p-3 flex gap-3 items-center">
            <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dominados</p>
              <p className="text-lg font-semibold">{userStats.masteredCards}</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1A1633] to-[#262051] border border-primary/10 p-3 flex gap-3 items-center">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <BarChart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progresso</p>
              <p className="text-lg font-semibold">23%</p>
            </div>
          </Card>
        </motion.div>}
      
      {/* Stats and Setup layout */}
      {!studyConfig && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* On mobile, show stats toggle and drawer */}
          <motion.div className="md:col-span-2" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.2
      }}>
            <FlashcardSetup onStartStudy={handleStartStudy} />
          </motion.div>
          
          {/* Stats on desktop */}
          {!isMobile && showStats && <motion.div className="md:col-span-1" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.3,
        delay: 0.3
      }}>
              <FlashcardExtendedStats onClose={() => setShowStats(false)} />
            </motion.div>}
          
          {/* Quick action buttons on mobile */}
          {isMobile && !showStats && <div className="fixed bottom-16 right-4 flex flex-col gap-2">
              <Button size="icon" onClick={() => setShowStats(true)} className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white mx-[8px] my-[30px]">
                <BarChart className="h-5 w-5" />
              </Button>
            </div>}
        </div>}

      {/* Study session */}
      {studyConfig && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }}>
          <FlashcardSession cards={filteredCards} showAnswers={studyConfig.showAnswers} studyMode={studyConfig.studyMode} autoNarrate={studyConfig.autoNarrate} onExit={handleExit} />
        </motion.div>}

      {/* Loading state */}
      {isLoading && !studyConfig && <Card className="p-6 animate-pulse bg-gradient-to-br from-[#1A1633] to-[#262051] border border-primary/10">
          <div className="h-8 bg-primary/10 rounded mb-4 w-1/3"></div>
          <div className="h-32 bg-primary/10 rounded mb-4"></div>
          <div className="h-8 bg-primary/10 rounded w-1/4"></div>
        </Card>}

      {/* Mobile Stats Dialog */}
      {isMobile && showStats && <motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }}>
          <motion.div className="w-full max-w-md" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} transition={{
        duration: 0.2
      }}>
            <FlashcardExtendedStats onClose={() => setShowStats(false)} />
          </motion.div>
        </motion.div>}
    </div>;
}