
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Trophy, User2 } from 'lucide-react';

interface TopPlayer {
  user_id: string;
  display_name: string | null;
  pontuacao: number;
  rank: number;
}

export const JogosTopPlayers = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_leaderboards')
          .select('user_id, pontuacao')
          .order('pontuacao', { ascending: false })
          .limit(5);
        
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
          const playersWithNames = data.map((player, index) => {
            const profile = profiles?.find(p => p.id === player.user_id);
            return {
              ...player,
              display_name: profile?.display_name || 'Jogador Anônimo',
              rank: index + 1
            };
          });
          
          setTopPlayers(playersWithNames);
        } else {
          setTopPlayers([]);
        }
      } catch (error) {
        console.error('Erro ao buscar top jogadores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopPlayers();
  }, []);
  
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-500';
      case 2: return 'text-slate-400';
      case 3: return 'text-amber-700';
      default: return 'text-slate-600';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Melhores Jogadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        ) : topPlayers.length > 0 ? (
          <div className="space-y-4">
            {topPlayers.map((player) => (
              <div key={player.user_id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`font-bold text-lg mr-3 ${getRankStyle(player.rank)}`}>
                    #{player.rank}
                  </span>
                  <div className="bg-muted p-1.5 rounded-full mr-2">
                    <User2 className="h-4 w-4 text-foreground/70" />
                  </div>
                  <span className="text-sm font-medium">
                    {player.display_name}
                  </span>
                </div>
                <span className="font-semibold">
                  {player.pontuacao} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Ainda não há jogadores classificados
          </div>
        )}
      </CardContent>
    </Card>
  );
};
