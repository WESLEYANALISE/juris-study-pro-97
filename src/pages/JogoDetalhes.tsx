
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { GameCategory } from './JogosJuridicos';
import { ChevronLeft, Trophy, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from '@/components/PageTransition';
import { JogosLeaderboard } from '@/components/jogos/JogosLeaderboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Importação dos jogos de palavras
import { CacaPalavras } from '@/components/jogos/jogos-tipos/CacaPalavras';
import { PalavrasCruzadas } from '@/components/jogos/jogos-tipos/PalavrasCruzadas';
import { JogoForca } from '@/components/jogos/jogos-tipos/JogoForca';

// Importação dos jogos existentes (futuramente poderemos remover)
import { QuizJogo } from '@/components/jogos/jogos-tipos/QuizJogo';
import { SimulacaoJulgamento } from '@/components/jogos/jogos-tipos/SimulacaoJulgamento';
import { EscritorioVirtual } from '@/components/jogos/jogos-tipos/EscritorioVirtual';
import { RPGJuridico } from '@/components/jogos/jogos-tipos/RPGJuridico';
import { JogoCartas } from '@/components/jogos/jogos-tipos/JogoCartas';

const JogoDetalhes = () => {
  const { jogoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameDetails, setGameDetails] = useState<GameCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!jogoId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_categorias')
          .select('*')
          .eq('id', jogoId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error('Jogo não encontrado');
          navigate('/jogos');
          return;
        }
        
        setGameDetails(data);
      } catch (error) {
        console.error('Erro ao carregar detalhes do jogo:', error);
        toast.error('Não foi possível carregar os detalhes do jogo');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGameDetails();
  }, [jogoId, navigate]);
  
  const renderGameContent = () => {
    if (!gameDetails) return null;
    
    switch (gameDetails.nome) {
      case 'Caça Palavras':
        return <CacaPalavras gameId={gameDetails.id} />;
      case 'Palavras Cruzadas':
        return <PalavrasCruzadas gameId={gameDetails.id} />;
      case 'Jogo da Forca':
        return <JogoForca gameId={gameDetails.id} />;
      case 'Enigmas Jurídicos':
        // Aqui adicionaríamos o componente de enigmas quando implementado
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
            <h3 className="text-2xl font-bold mb-4">Jogo em Desenvolvimento</h3>
            <p className="text-muted-foreground mb-6">
              Este jogo está atualmente em desenvolvimento e será disponibilizado em breve.
              Aguarde por novas atualizações na plataforma!
            </p>
            <Button onClick={() => navigate('/jogos')}>Voltar para Jogos</Button>
          </div>
        );
      case 'Pares Jurídicos':
      case 'Preencha os Espaços':
      case 'Desembaralhe Palavras':
      case 'Alfabeto Jurídico':
      case 'Memória Jurídica':
        // Componentes a serem implementados para os outros jogos de palavras
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
            <h3 className="text-2xl font-bold mb-4">Jogo em Desenvolvimento</h3>
            <p className="text-muted-foreground mb-6">
              Este jogo está atualmente em desenvolvimento e será disponibilizado em breve.
              Aguarde por novas atualizações na plataforma!
            </p>
            <Button onClick={() => navigate('/jogos')}>Voltar para Jogos</Button>
          </div>
        );
      // Mantive os casos dos jogos antigos para compatibilidade, podemos removê-los quando estiver tudo migrado
      case 'Quiz de Direito':
        return <QuizJogo gameId={gameDetails.id} />;
      case 'Simulações de Julgamentos':
        return <SimulacaoJulgamento gameId={gameDetails.id} />;
      case 'Escritório Virtual':
        return <EscritorioVirtual gameId={gameDetails.id} />;
      case 'RPG Jurídico':
        return <RPGJuridico gameId={gameDetails.id} />;
      case 'Jogo de Cartas de Artigos':
        return <JogoCartas gameId={gameDetails.id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
            <h3 className="text-2xl font-bold mb-4">Jogo em Desenvolvimento</h3>
            <p className="text-muted-foreground mb-6">
              Este jogo está atualmente em desenvolvimento e será disponibilizado em breve.
              Aguarde por novas atualizações na plataforma!
            </p>
            <Button onClick={() => navigate('/jogos')}>Voltar para Jogos</Button>
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!gameDetails) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Jogo não encontrado</h2>
        <Button onClick={() => navigate('/jogos')}>Voltar para Jogos</Button>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <JuridicalBackground variant="scales" opacity={0.03}>
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jogos')}
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar para jogos
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{gameDetails?.nome}</h1>
            <p className="text-muted-foreground">{gameDetails?.descricao}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {gameDetails?.nivel_dificuldade}
              </span>
            </div>
          </div>
          
          <Tabs defaultValue="jogar">
            <TabsList className="mb-6">
              <TabsTrigger value="jogar">Jogar</TabsTrigger>
              <TabsTrigger value="ranking">
                <Trophy className="h-4 w-4 mr-1" /> Ranking
              </TabsTrigger>
              <TabsTrigger value="estatisticas">
                <BarChart className="h-4 w-4 mr-1" /> Estatísticas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="jogar" className="mt-0">
              <JuridicalCard
                title={gameDetails?.nome || ''}
                description={gameDetails?.descricao || 'Jogo interativo de conteúdo jurídico'}
                icon={gameDetails?.icone as string}
                variant="default"
                className="md:p-4"
              >
                {renderGameContent()}
              </JuridicalCard>
            </TabsContent>
            
            <TabsContent value="ranking" className="mt-0">
              {gameDetails && <JogosLeaderboard gameId={gameDetails.id} />}
            </TabsContent>
            
            <TabsContent value="estatisticas" className="mt-0">
              <JuridicalCard
                title="Estatísticas do Jogo"
                description="Dados estatísticos e métricas de desempenho"
                icon="book"
                variant="default"
                className="md:p-4"
              >
                <p className="p-6">Estatísticas detalhadas para este jogo serão implementadas em breve.</p>
              </JuridicalCard>
            </TabsContent>
          </Tabs>
        </div>
      </JuridicalBackground>
    </PageTransition>
  );
};

export default JogoDetalhes;
