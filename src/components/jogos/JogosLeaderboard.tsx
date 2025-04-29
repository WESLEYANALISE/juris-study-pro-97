
import React, { useState, useEffect } from 'react';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Trophy, User2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface JogosLeaderboardProps {
  gameId: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  pontuacao: number;
  rank: number;
}

export const JogosLeaderboard = ({ gameId }: JogosLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_leaderboards')
          .select('user_id, pontuacao')
          .eq('jogo_id', gameId)
          .order('pontuacao', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Fetch profile info for user_ids
          const userIds = data.map(item => item.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);
          
          if (profilesError) throw profilesError;
          
          // Combine data
          const entriesWithNames = data.map((entry, index) => {
            const profile = profiles?.find(p => p.id === entry.user_id);
            return {
              ...entry,
              display_name: profile?.display_name || 'Jogador Anônimo',
              rank: index + 1
            };
          });
          
          setLeaderboard(entriesWithNames);
        } else {
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Erro ao buscar ranking:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [gameId]);
  
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-500';
      case 2: return 'text-slate-400';
      case 3: return 'text-amber-700';
      default: return 'text-slate-600';
    }
  };
  
  return (
    <JuridicalCard
      title="Ranking dos Jogadores"
      icon="trophy"
      variant="default"
    >
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="divide-y">
          {leaderboard.map((entry) => (
            <div 
              key={entry.user_id} 
              className={`flex items-center justify-between p-4 ${entry.user_id === user?.id ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-center">
                <span className={`font-bold text-lg w-8 ${getRankStyle(entry.rank)}`}>
                  #{entry.rank}
                </span>
                <div className="bg-muted p-1.5 rounded-full mr-2">
                  <User2 className="h-4 w-4 text-foreground/70" />
                </div>
                <span className="font-medium">
                  {entry.display_name}
                  {entry.user_id === user?.id ? ' (Você)' : ''}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">{entry.pontuacao}</span>
                <span className="text-xs ml-1 text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground">Ainda não há dados de ranking para este jogo.</p>
          <p className="text-sm text-muted-foreground mt-2">Jogue para ser o primeiro no ranking!</p>
        </div>
      )}
    </JuridicalCard>
  );
};
