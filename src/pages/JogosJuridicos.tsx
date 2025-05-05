
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { JogosHeroSection } from '@/components/jogos/JogosHeroSection';
import { JogosGameGrid } from '@/components/jogos/JogosGameGrid';
import { JogosTopPlayers } from '@/components/jogos/JogosTopPlayers';
import { JogosUserStats } from '@/components/jogos/JogosUserStats';
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { PageTransition } from '@/components/PageTransition';

export interface GameCategory {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  background_variant: string;
  nivel_dificuldade: string;
}

const JogosJuridicos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameCategories, setGameCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('todos');

  useEffect(() => {
    const fetchGameCategories = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_categorias')
          .select('*')
          .eq('ativo', true)
          .order('nome');
        
        if (error) {
          throw error;
        }
        
        setGameCategories(data || []);
      } catch (error) {
        console.error('Erro ao carregar categorias de jogos:', error);
        toast.error('Não foi possível carregar os jogos disponíveis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameCategories();
  }, []);

  const filteredGames = activeTab === 'todos'
    ? gameCategories
    : gameCategories.filter(game => game.nivel_dificuldade === activeTab);

  return (
    <PageTransition>
      <JuridicalBackground variant="scales" opacity={0.03}>
        <div className="container mx-auto px-4 py-6">
          <JogosHeroSection />
          
          <div className="mt-8">
            <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="todos">Todos os Jogos</TabsTrigger>
                  <TabsTrigger value="iniciante">Iniciante</TabsTrigger>
                  <TabsTrigger value="intermediário">Intermediário</TabsTrigger>
                  <TabsTrigger value="avançado">Avançado</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <TabsContent value="todos" className="mt-0">
                    <JogosGameGrid games={filteredGames} isLoading={isLoading} />
                  </TabsContent>
                  <TabsContent value="iniciante" className="mt-0">
                    <JogosGameGrid games={filteredGames} isLoading={isLoading} />
                  </TabsContent>
                  <TabsContent value="intermediário" className="mt-0">
                    <JogosGameGrid games={filteredGames} isLoading={isLoading} />
                  </TabsContent>
                  <TabsContent value="avançado" className="mt-0">
                    <JogosGameGrid games={filteredGames} isLoading={isLoading} />
                  </TabsContent>
                </div>
                
                <div className="space-y-6">
                  {user && <JogosUserStats userId={user.id} />}
                  <JogosTopPlayers />
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </JuridicalBackground>
    </PageTransition>
  );
};

export default JogosJuridicos;
