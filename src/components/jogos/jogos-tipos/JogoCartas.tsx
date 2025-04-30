import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Baralho, Artigo } from '@/types/jogos';
import { GraduationCap } from 'lucide-react';

interface JogoCartasProps {
  gameId: string;
}

export const JogoCartas = ({ gameId }: JogoCartasProps) => {
  const { user } = useAuth();
  const [baralhos, setBaralhos] = useState<Baralho[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [baralhoSelecionado, setBaralhoSelecionado] = useState<Baralho | null>(null);
  const [artigoAtual, setArtigoAtual] = useState<Artigo | null>(null);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [cartasVistas, setCartasVistas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [baralhoFinalizado, setBaralhoFinalizado] = useState(false);

  useEffect(() => {
    const fetchBaralhos = async () => {
      try {
        setIsLoading(true);
        
        // Use type assertion to handle Supabase types
        const { data: baralhosData, error: baralhosError } = await supabase
          .from('jogos_cartas_baralhos')
          .select('*')
          .order('area_direito', { ascending: true });
        
        if (baralhosError) throw baralhosError;
        
        setBaralhos(baralhosData as unknown as Baralho[]);
      } catch (error) {
        console.error('Erro ao carregar baralhos:', error);
        toast.error('Não foi possível carregar os baralhos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBaralhos();
  }, []);
  
  useEffect(() => {
    if (baralhoSelecionado) {
      const fetchArtigos = async () => {
        try {
          setIsLoading(true);
          
          // Use type assertion to handle Supabase types
          const { data: artigosData, error: artigosError } = await supabase
            .from('jogos_cartas_artigos')
            .select('*')
            .eq('baralho_id', baralhoSelecionado.id)
            .order('id', { ascending: false });
          
          if (artigosError) throw artigosError;
          
          setArtigos(artigosData as unknown as Artigo[]);
          
          // Selecionando o primeiro artigo
          if (artigosData && artigosData.length > 0) {
            setArtigoAtual(artigosData[0] as unknown as Artigo);
          }
          
          setCartasVistas([]);
          setPontuacao(0);
          setMostrarResposta(false);
          setBaralhoFinalizado(false);
        } catch (error) {
          console.error('Erro ao carregar artigos:', error);
          toast.error('Não foi possível carregar os artigos do baralho');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchArtigos();
    }
  }, [baralhoSelecionado]);

  const handleProximaCartaClick = () => {
    if (!artigoAtual) return;
    
    // Adicionar o artigo atual à lista de vistos
    setCartasVistas(prev => [...prev, artigoAtual.id]);
    
    // Se mostrou resposta, adiciona pontos
    if (mostrarResposta) {
      setPontuacao(prev => prev + (artigoAtual?.pontos || 1));
    }
    
    // Pegando o próximo artigo não visto
    const artigosNaoVistos = artigos.filter(a => !cartasVistas.includes(a.id) && a.id !== artigoAtual.id);
    
    if (artigosNaoVistos.length > 0) {
      // Pega um artigo aleatório
      const randomIndex = Math.floor(Math.random() * artigosNaoVistos.length);
      setArtigoAtual(artigosNaoVistos[randomIndex]);
      setMostrarResposta(false);
    } else {
      // Finalizar o jogo
      setArtigoAtual(null);
      setBaralhoFinalizado(true);
      salvarProgresso();
    }
  };
  
  const salvarProgresso = async () => {
    if (!user || !baralhoSelecionado) return;
    
    try {
      // Salvar partida
      await supabase.from('jogos_cartas_partidas').insert({
        user_id: user.id,
        baralho_id: baralhoSelecionado.id,
        jogo_id: gameId,
        pontuacao: pontuacao,
        completada: true
      });
      
      // Atualizar estatísticas do usuário
      await supabase.from('jogos_user_stats').upsert({
        user_id: user.id,
        jogo_id: gameId,
        pontuacao: pontuacao,
        partidas_jogadas: 1,
        partidas_vencidas: 1,
        ultimo_acesso: new Date().toISOString()
      }, { onConflict: 'user_id, jogo_id' });
      
      toast.success(`Baralho concluído! Pontuação: ${pontuacao}`);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };
  
  const reiniciarBaralho = () => {
    setArtigoAtual(artigos[0]);
    setCartasVistas([]);
    setPontuacao(0);
    setMostrarResposta(false);
    setBaralhoFinalizado(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner />
        </div>
      ) : !baralhoSelecionado ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Escolha um Baralho</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baralhos.map(baralho => (
              <Card key={baralho.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setBaralhoSelecionado(baralho)}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    {baralho.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{baralho.descricao}</p>
                  <div className="mt-2">
                    <Badge>{baralho.area_direito}</Badge>
                    {baralho.nivel_dificuldade && (
                      <Badge variant="outline" className="ml-2">{baralho.nivel_dificuldade}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : baralhoFinalizado ? (
        <Card>
          <CardHeader>
            <CardTitle>Baralho Concluído!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <h3 className="text-3xl font-bold">{pontuacao} pontos</h3>
              <p className="mt-2 text-muted-foreground">Você completou o baralho {baralhoSelecionado.nome}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setBaralhoSelecionado(null)}>Escolher Outro Baralho</Button>
            <Button onClick={reiniciarBaralho}>Jogar Novamente</Button>
          </CardFooter>
        </Card>
      ) : artigoAtual ? (
        <Card>
          <CardHeader>
            <CardTitle>{baralhoSelecionado.nome}</CardTitle>
            <div className="flex justify-between items-center">
              <Badge>{artigoAtual.lei}</Badge>
              <span className="text-sm text-muted-foreground">Pontuação: {pontuacao}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary p-4 rounded-md mb-4">
              <h3 className="font-bold mb-2">Artigo {artigoAtual.artigo}</h3>
              {mostrarResposta ? (
                <p>{artigoAtual.texto}</p>
              ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-primary/30 rounded">
                  <p className="text-muted-foreground">Clique para revelar o conteúdo do artigo</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            {!mostrarResposta ? (
              <Button 
                className="w-full" 
                onClick={() => setMostrarResposta(true)}
              >
                Revelar Artigo
              </Button>
            ) : (
              <Button 
                className="w-full" 
                variant="default"
                onClick={handleProximaCartaClick}
              >
                Próxima Carta
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="flex justify-center items-center p-8">
          <p>Nenhuma carta disponível para este baralho.</p>
        </div>
      )}
    </div>
  );
};
