
import React, { useState, useEffect } from 'react';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Trophy, User2, Medal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

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
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Buscar top 10 jogadores
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
          
          // Find current user's rank if they're not in top 10
          if (user && !entriesWithNames.some(entry => entry.user_id === user.id)) {
            const { data: userRankData, error: userRankError } = await supabase
              .from('jogos_leaderboards')
              .select('user_id, pontuacao')
              .eq('jogo_id', gameId)
              .eq('user_id', user.id)
              .single();
              
            if (!userRankError && userRankData) {
              // Get count of players with higher score
              const { count: higherScores, error: countError } = await supabase
                .from('jogos_leaderboards')
                .select('*', { count: 'exact', head: true })
                .eq('jogo_id', gameId)
                .gt('pontuacao', userRankData.pontuacao);
                
              if (!countError) {
                const { data: userProfile } = await supabase
                  .from('profiles')
                  .select('display_name')
                  .eq('id', user.id)
                  .single();
                  
                setUserRank({
                  ...userRankData,
                  display_name: userProfile?.display_name || 'Você',
                  rank: (higherScores || 0) + 1
                });
              }
            }
          }
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
  }, [gameId, user]);
  
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-500';
      case 2: return 'text-slate-400';
      case 3: return 'text-amber-700';
      default: return 'text-slate-600';
    }
  };
  
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };
  
  return (
    <JuridicalCard
      title="Ranking dos Jogadores"
      description="Classificação dos melhores jogadores"
      icon="scroll"
      variant="default"
    >
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : leaderboard.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {leaderboard.slice(0, 3).map((entry) => (
              <div 
                key={entry.user_id} 
                className={`flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-b ${
                  entry.rank === 1 ? 'from-amber-50 to-amber-100 border border-amber-200' : 
                  entry.rank === 2 ? 'from-slate-50 to-slate-100 border border-slate-200' : 
                  'from-orange-50 to-orange-100 border border-orange-200'
                } ${entry.user_id === user?.id ? 'ring-2 ring-primary' : ''}`}
              >
                {getMedalIcon(entry.rank)}
                <div className={`text-2xl font-bold mt-2 ${getRankStyle(entry.rank)}`}>
                  #{entry.rank}
                </div>
                <div className="bg-white p-2 rounded-full my-2">
                  <User2 className="h-8 w-8 text-slate-700" />
                </div>
                <div className="font-medium text-center">
                  {entry.display_name}
                  {entry.user_id === user?.id ? ' (Você)' : ''}
                </div>
                <div className="flex items-center mt-2">
                  <span className="font-bold text-xl">{entry.pontuacao}</span>
                  <span className="text-xs ml-1 text-muted-foreground">pts</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="divide-y">
            {leaderboard.slice(3).map((entry) => (
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
          
          {userRank && !leaderboard.some(entry => entry.user_id === user?.id) && (
            <div className="mt-4 p-3 border-t">
              <div className="flex items-center justify-between py-2 px-4 bg-primary/5 rounded-md">
                <div className="flex items-center">
                  <span className="font-bold text-lg w-8 text-primary">
                    #{userRank.rank}
                  </span>
                  <div className="bg-primary/20 p-1.5 rounded-full mr-2">
                    <User2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">
                    {userRank.display_name} (Você)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">{userRank.pontuacao}</span>
                  <span className="text-xs ml-1 text-muted-foreground">pts</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground">Ainda não há dados de ranking para este jogo.</p>
          <p className="text-sm text-muted-foreground mt-2">Jogue para ser o primeiro no ranking!</p>
          {user && (
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Atualizar Ranking
            </Button>
          )}
        </div>
      )}
    </JuridicalCard>
  );
};
