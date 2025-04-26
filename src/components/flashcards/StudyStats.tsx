
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Calendar, Clock, Award } from "lucide-react";

export function StudyStats() {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get current user
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    }
    
    getCurrentUser();
  }, []);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["flashcard-stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get count of cards in progress
      const { count: cardsInProgress } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // Get count of mastered cards (knowledge level 5)
      const { count: masteredCards } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('conhecimento', 5);
      
      // Get cards due for review today
      const today = new Date().toISOString().split('T')[0];
      const { count: dueToday } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('proxima_revisao', today + 'T23:59:59Z');
      
      // Get study streak from gamification table if available
      const { data: gamification } = await supabase
        .from('gamificacao')
        .select('streak_dias, ultima_atividade')
        .eq('user_id', userId)
        .single();
      
      const streakDays = gamification?.streak_dias || 0;
      const lastActivity = gamification?.ultima_atividade || null;
      
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
      
      return {
        cardsInProgress: cardsInProgress || 0,
        masteredCards: masteredCards || 0,
        dueToday: dueToday || 0,
        streakDays,
        streakActive
      };
    },
    enabled: !!userId,
  });
  
  if (isLoading) {
    return (
      <Card className="p-4 flex flex-col items-center justify-center animate-pulse h-[120px]">
        <div className="w-1/2 h-6 bg-muted rounded mb-2"></div>
        <div className="w-3/4 h-4 bg-muted rounded"></div>
      </Card>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  return (
    <Card className="p-4">
      <div className="text-lg font-semibold mb-3 flex items-center">
        <Brain className="mr-2 text-primary h-5 w-5" />
        Estatísticas de Estudo
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <div>
            <div className="text-xs text-muted-foreground">Cartões em Progresso</div>
            <div className="font-semibold">{stats.cardsInProgress}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-500" />
          <div>
            <div className="text-xs text-muted-foreground">Cartões Dominados</div>
            <div className="font-semibold">{stats.masteredCards}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-xs text-muted-foreground">Para Revisar Hoje</div>
            <div className="font-semibold">{stats.dueToday}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-violet-500" />
          <div>
            <div className="text-xs text-muted-foreground">Sequência de Estudos</div>
            <div className="font-semibold">
              {stats.streakDays} dia{stats.streakDays !== 1 ? 's' : ''} 
              {stats.streakActive ? 
                <span className="text-xs text-emerald-500 ml-1">✓ ativa</span> : 
                <span className="text-xs text-gray-400 ml-1">inativa</span>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
