
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, BookOpen, Brain, Calendar, ChevronRight, Clock, Flame, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardStatsProps {
  onClose?: () => void;
  className?: string;
}

export function FlashcardExtendedStats({ onClose, className }: FlashcardStatsProps) {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    }
    
    getCurrentUser();
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["flashcard-extended-stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get cards in progress
      const { count: cardsInProgress } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // Get mastered cards
      const { count: masteredCards } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('conhecimento', 5);
      
      // Cards due for review today
      const today = new Date().toISOString().split('T')[0];
      const { count: dueToday } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('proxima_revisao', today + 'T23:59:59Z');
      
      // Get total available cards
      const { count: totalCards } = await supabase
        .from('flash_cards_improved')
        .select('*', { count: 'exact', head: true });
        
      // Get study streak
      const { data: gamification } = await supabase
        .from('gamificacao')
        .select('streak_dias, ultima_atividade, pontos, nivel')
        .eq('user_id', userId)
        .single();
      
      const streakDays = gamification?.streak_dias || 0;
      const lastActivity = gamification?.ultima_atividade || null;
      const points = gamification?.pontos || 0;
      const level = gamification?.nivel || 1;
      
      // Get knowledge levels distribution
      const { data: knowledgeLevels } = await supabase
        .from('user_flashcards')
        .select('conhecimento')
        .eq('user_id', userId);
        
      const knowledgeDistribution = [0, 0, 0, 0, 0, 0]; // 0-5 levels
      
      if (knowledgeLevels) {
        knowledgeLevels.forEach(item => {
          const level = item.conhecimento;
          if (level >= 0 && level <= 5) {
            knowledgeDistribution[level]++;
          }
        });
      }
      
      // Calculate streak status
      let streakActive = false;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        streakActive = (
          lastDate.toDateString() === today.toDateString() || 
          lastDate.toDateString() === yesterday.toDateString()
        );
      }
      
      // Get area progress
      const { data: areaStats } = await supabase
        .from('user_flashcards')
        .select('flash_cards_improved!inner(area)')
        .eq('user_id', userId);
        
      const areaProgress: Record<string, {total: number, mastered: number}> = {};
      
      if (areaStats) {
        areaStats.forEach(item => {
          const area = item.flash_cards_improved.area;
          if (!areaProgress[area]) {
            areaProgress[area] = {total: 0, mastered: 0};
          }
          areaProgress[area].total++;
          if (item.conhecimento === 5) {
            areaProgress[area].mastered++;
          }
        });
      }
      
      return {
        cardsInProgress: cardsInProgress || 0,
        masteredCards: masteredCards || 0,
        dueToday: dueToday || 0,
        totalCards: totalCards || 0,
        streakDays,
        streakActive,
        points,
        level,
        knowledgeDistribution,
        areaProgress
      };
    },
    enabled: !!userId,
  });
  
  if (isLoading) {
    return (
      <Card className={cn("w-full animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="h-6 bg-primary/10 w-1/3 rounded"></div>
            {onClose && <div className="h-6 w-6 bg-primary/10 rounded-full"></div>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 bg-primary/5 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-primary/5 rounded"></div>
            <div className="h-16 bg-primary/5 rounded"></div>
            <div className="h-16 bg-primary/5 rounded"></div>
            <div className="h-16 bg-primary/5 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Estatísticas de Estudo</CardTitle>
          <CardDescription>Você precisa estar logado para ver suas estatísticas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalMastery = stats.cardsInProgress > 0 
    ? Math.round((stats.masteredCards / stats.cardsInProgress) * 100) 
    : 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          Estatísticas de Estudo
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mastery progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Progresso de Domínio</span>
            <span className="text-sm font-medium">{totalMastery}%</span>
          </div>
          <Progress value={totalMastery} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.masteredCards} dominados</span>
            <span>{stats.cardsInProgress} estudados</span>
          </div>
        </div>
        
        {/* Cards stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Zap className="h-8 w-8 text-amber-500" />
            <div>
              <div className="text-xs text-muted-foreground">Cartões em Progresso</div>
              <div className="font-semibold text-lg">{stats.cardsInProgress}</div>
              <div className="text-xs text-primary">
                {Math.round((stats.cardsInProgress / (stats.totalCards || 1)) * 100)}% do total
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Star className="h-8 w-8 text-emerald-500" />
            <div>
              <div className="text-xs text-muted-foreground">Cartões Dominados</div>
              <div className="font-semibold text-lg">{stats.masteredCards}</div>
              <div className="text-xs text-emerald-600">
                {stats.cardsInProgress > 0 
                  ? `${Math.round((stats.masteredCards / stats.cardsInProgress) * 100)}% dos estudados` 
                  : 'Comece a estudar'}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-xs text-muted-foreground">Para Revisar Hoje</div>
              <div className="font-semibold text-lg">{stats.dueToday}</div>
              <div className="text-xs text-blue-600">
                {stats.cardsInProgress > 0 
                  ? `${Math.round((stats.dueToday / stats.cardsInProgress) * 100)}% dos seus cartões`
                  : 'Sem revisões pendentes'
                }
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-xs text-muted-foreground">Sequência de Estudos</div>
              <div className="font-semibold text-lg flex items-center">
                {stats.streakDays} dias
                {stats.streakActive ? (
                  <span className="ml-1 p-1 rounded-full bg-orange-500/20 flex">
                    <span className="sr-only">Ativo</span>
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-orange-600">
                {stats.streakActive ? 'Sequência ativa' : 'Estude hoje!'}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Knowledge distribution */}
        <div className="pt-2">
          <div className="text-sm font-medium mb-2">Distribuição de Conhecimento</div>
          <div className="flex gap-1 h-8">
            {stats.knowledgeDistribution.map((count, level) => {
              const total = stats.knowledgeDistribution.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              // Skip level 0 in the visualization
              if (level === 0) return null;
              
              const levelColors = [
                "bg-red-500", 
                "bg-orange-500", 
                "bg-yellow-500", 
                "bg-lime-500", 
                "bg-green-500", 
                "bg-emerald-500"
              ];
              
              return (
                <div 
                  key={level} 
                  className={cn(
                    "rounded-sm relative group", 
                    levelColors[level],
                    count === 0 ? "opacity-30" : "opacity-80"
                  )}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-75 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                    Nível {level}: {count} cartões
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Iniciante</span>
            <span>Dominado</span>
          </div>
        </div>
        
        {/* Areas progress */}
        {Object.keys(stats.areaProgress).length > 0 && (
          <div className="pt-2">
            <div className="text-sm font-medium mb-2">Progresso por Área</div>
            <div className="space-y-2">
              {Object.entries(stats.areaProgress).map(([area, progress]) => {
                const masteryPercentage = progress.total > 0 
                  ? Math.round((progress.mastered / progress.total) * 100)
                  : 0;
                
                return (
                  <div key={area} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{area}</span>
                      <span>{masteryPercentage}%</span>
                    </div>
                    <Progress value={masteryPercentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* User level */}
        <div className="flex items-center justify-between border-t pt-4 mt-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Nível {stats.level}</div>
              <div className="text-xs text-muted-foreground">{stats.points} pontos</div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>Ver Detalhes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
