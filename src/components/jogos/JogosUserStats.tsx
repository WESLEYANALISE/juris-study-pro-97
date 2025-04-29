
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface UserStatsProps {
  userId: string;
}

interface UserGameStats {
  total_jogos: number;
  total_pontos: number;
  badges: number;
  jogo_favorito?: string;
}

export const JogosUserStats = ({ userId }: UserStatsProps) => {
  const [stats, setStats] = useState<UserGameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch total games played
        const { data: statData, error: statError } = await supabase
          .from('jogos_user_stats')
          .select('jogo_id, partidas_jogadas, pontuacao')
          .eq('user_id', userId);
          
        if (statError) throw statError;
        
        // Fetch badges
        const { count: badgesCount, error: badgesError } = await supabase
          .from('jogos_user_badges')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (badgesError) throw badgesError;
        
        // Calculate stats
        const totalJogos = statData?.reduce((acc, curr) => acc + (curr.partidas_jogadas || 0), 0) || 0;
        const totalPontos = statData?.reduce((acc, curr) => acc + (curr.pontuacao || 0), 0) || 0;
        
        // Find favorite game (game with most plays)
        let jogoFavoritoId: string | undefined;
        let maxPartidas = 0;
        
        if (statData && statData.length > 0) {
          statData.forEach(stat => {
            if ((stat.partidas_jogadas || 0) > maxPartidas) {
              maxPartidas = stat.partidas_jogadas || 0;
              jogoFavoritoId = stat.jogo_id;
            }
          });
        }
        
        // Get favorite game name if exists
        let jogoFavoritoNome: string | undefined;
        
        if (jogoFavoritoId) {
          const { data: gameData } = await supabase
            .from('jogos_categorias')
            .select('nome')
            .eq('id', jogoFavoritoId)
            .single();
            
          jogoFavoritoNome = gameData?.nome;
        }
        
        setStats({
          total_jogos: totalJogos,
          total_pontos: totalPontos,
          badges: badgesCount || 0,
          jogo_favorito: jogoFavoritoNome
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [userId]);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Minhas Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Jogos</p>
                <p className="text-2xl font-bold">{stats?.total_jogos || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Pontos</p>
                <p className="text-2xl font-bold">{stats?.total_pontos || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center">
                <Medal className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm">Conquistas</span>
              </div>
              <span className="font-semibold">{stats?.badges || 0}</span>
            </div>
            
            {stats?.jogo_favorito && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Jogo Favorito</span>
                </div>
                <span className="text-sm font-semibold">{stats.jogo_favorito}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
