
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { BookOpen, LayoutGrid, Diamond } from 'lucide-react';
import { Baralho, Artigo } from '@/types/jogos';

interface JogoCartasProps {
  gameId: string;
}

export const JogoCartas = ({ gameId }: JogoCartasProps) => {
  const { user } = useAuth();
  const [baralhos, setBaralhos] = useState<Baralho[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [baralhoSelecionado, setBaralhoSelecionado] = useState<Baralho | null>(null);
  const [maoJogador, setMaoJogador] = useState<Artigo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('baralhos');
  const [pontuacao, setPontuacao] = useState(0);
  
  useEffect(() => {
    const fetchBaralhos = async () => {
      try {
        setIsLoading(true);
        
        // Using a more type-safe approach without type assertions
        const { data, error } = await supabase
          .from('jogos_cartas_baralhos')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        
        setBaralhos(data || []);
      } catch (error) {
        console.error('Erro ao carregar baralhos:', error);
        toast.error('Não foi possível carregar os baralhos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBaralhos();
  }, []);
  
  const handleSelecionarBaralho = async (baralho: Baralho) => {
    setBaralhoSelecionado(baralho);
    
    try {
      // Using a more type-safe approach without type assertions
      const { data, error } = await supabase
        .from('jogos_cartas_artigos')
        .select('*')
        .eq('baralho_id', baralho.id);
      
      if (error) throw error;
      
      setArtigos(data || []);
      
      // Selecionar 5 cartas aleatórias para a mão inicial
      if (data && data.length >= 5) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setMaoJogador(shuffled.slice(0, 5));
      } else {
        setMaoJogador(data || []);
      }
      
      setActiveTab('jogar');
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      toast.error('Não foi possível carregar este baralho');
    }
  };
  
  const handleJogarCarta = (carta: Artigo) => {
    // Simular jogar a carta
    toast.success(`Você jogou: ${carta.lei} - ${carta.artigo}`);
    
    // Remover da mão
    setMaoJogador(mao => mao.filter(c => c.id !== carta.id));
    
    // Adicionar pontuação
    setPontuacao(prev => prev + carta.pontos);
    
    // Se não houver mais cartas, registrar a partida
    if (maoJogador.length <= 1 && user) {
      registerPartida();
    }
  };
  
  const registerPartida = async () => {
    if (!user || !baralhoSelecionado) return;
    
    try {
      // Using type assertion to bypass type checking for the Supabase client
      await supabase
        .from('jogos_cartas_partidas')
        .insert({
          user_id: user.id,
          baralho_id: baralhoSelecionado.id,
          pontuacao: pontuacao,
          completada: true,
          jogo_id: gameId
        }) as any;
        
      toast.success('Partida concluída! Pontuação registrada.');
    } catch (error) {
      console.error('Erro ao registrar partida:', error);
    }
  };
  
  const iniciarNovaPartida = () => {
    if (!artigos.length) return;
    
    // Reembaralhar e pegar novas cartas
    const shuffled = [...artigos].sort(() => Math.random() - 0.5);
    setMaoJogador(shuffled.slice(0, 5) as Artigo[]);
    setPontuacao(0);
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="baralhos">
            <LayoutGrid className="h-4 w-4 mr-2" /> 
            Baralhos
          </TabsTrigger>
          {baralhoSelecionado && (
            <TabsTrigger value="jogar">
              <Diamond className="h-4 w-4 mr-2" /> 
              Jogar
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="baralhos">
          {baralhos.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Nenhum baralho disponível no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baralhos.map(baralho => (
                <Card 
                  key={baralho.id} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleSelecionarBaralho(baralho)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      {baralho.nome}
                    </CardTitle>
                    <p className="text-sm mt-1">Área: {baralho.area_direito}</p>
                    <p className={`text-xs font-medium ${baralho.nivel_dificuldade === 'iniciante' ? 'text-green-600' : baralho.nivel_dificuldade === 'intermediário' ? 'text-amber-600' : 'text-red-600'}`}>
                      Dificuldade: {baralho.nivel_dificuldade}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{baralho.descricao}</p>
                    <Button className="mt-4 w-full">Selecionar Baralho</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="jogar">
          {baralhoSelecionado && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{baralhoSelecionado.nome}</h3>
                <div className="text-lg font-bold">
                  Pontuação: {pontuacao}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-medium mb-3">Instruções:</h4>
                <p>Selecione uma carta da sua mão para jogar. Cada carta tem um valor em pontos.</p>
                <p className="mt-2">Objetivo: Use os artigos mais relevantes para conseguir mais pontos.</p>
              </div>
              
              <h4 className="text-lg font-medium mb-2">Sua mão:</h4>
              {maoJogador.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maoJogador.map(carta => (
                    <div 
                      key={carta.id} 
                      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleJogarCarta(carta)}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold">{carta.lei}</h5>
                        <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-full text-xs">
                          {carta.pontos} pts
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{carta.artigo}</p>
                      <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                        {carta.texto}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <p>Você não tem mais cartas na mão.</p>
                  <Button 
                    className="mt-4"
                    onClick={iniciarNovaPartida}
                  >
                    Iniciar Nova Partida
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
