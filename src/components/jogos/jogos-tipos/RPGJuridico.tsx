
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { GitBranch, Clock, Trophy, History } from 'lucide-react';

interface RPGJuridicoProps {
  gameId: string;
}

interface Cenario {
  id: string;
  titulo: string;
  descricao: string;
  situacao_inicial: string;
  opcoes: Array<{ id: number; texto: string }>;
  consequencias: Array<{ opcao_id: number; resultado: string; pontos: number }>;
  area_direito: string;
  nivel_dificuldade: string;
}

interface Progresso {
  id: string;
  cenario_id: string;
  caminho_escolhido: {
    opcao_id: number;
    resultado: string;
    pontos: number;
  } | null;
  pontuacao: number;
  completado: boolean;
}

export const RPGJuridico = ({ gameId }: RPGJuridicoProps) => {
  const { user } = useAuth();
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [progressos, setProgressos] = useState<Progresso[]>([]);
  const [cenarioSelecionado, setCenarioSelecionado] = useState<Cenario | null>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<{ texto: string; pontos: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('cenarios');
  
  useEffect(() => {
    const fetchCenarios = async () => {
      try {
        setIsLoading(true);
        
        const { data: cenariosData, error: cenariosError } = await supabase
          .from('jogos_rpg_cenarios')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (cenariosError) throw cenariosError;
        setCenarios(cenariosData || []);
        
        if (user) {
          const { data: progressosData, error: progressosError } = await supabase
            .from('jogos_rpg_progresso')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (progressosError) throw progressosError;
          setProgressos(progressosData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar cenários:', error);
        toast.error('Não foi possível carregar os cenários');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCenarios();
  }, [user]);
  
  const handleCenarioSelecao = (cenario: Cenario) => {
    setCenarioSelecionado(cenario);
    setOpcaoSelecionada(null);
    setResultado(null);
    
    // Verificar se usuário já completou este cenário
    const progressoExistente = progressos.find(p => p.cenario_id === cenario.id);
    if (progressoExistente && progressoExistente.completado) {
      const consequencia = cenario.consequencias.find(
        c => c.opcao_id === progressoExistente.caminho_escolhido?.opcao_id
      );
      if (consequencia) {
        setResultado({
          texto: consequencia.resultado,
          pontos: consequencia.pontos
        });
        setOpcaoSelecionada(consequencia.opcao_id);
      }
    }
  };
  
  const handleEscolhaOpcao = (opcaoId: number) => {
    setOpcaoSelecionada(opcaoId);
  };
  
  const handleSubmitEscolha = async () => {
    if (!user || !cenarioSelecionado || opcaoSelecionada === null) return;
    
    try {
      setIsSubmitting(true);
      
      // Verificar se já existe progresso completado
      const progressoExistente = progressos.find(
        p => p.cenario_id === cenarioSelecionado.id && p.completado
      );
      
      if (progressoExistente) {
        toast.error('Você já completou este cenário');
        return;
      }
      
      const consequencia = cenarioSelecionado.consequencias.find(
        c => c.opcao_id === opcaoSelecionada
      );
      
      if (!consequencia) {
        toast.error('Opção inválida');
        return;
      }
      
      // Registrar a escolha
      const { data, error } = await supabase
        .from('jogos_rpg_progresso')
        .insert({
          cenario_id: cenarioSelecionado.id,
          user_id: user.id,
          caminho_escolhido: {
            opcao_id: opcaoSelecionada,
            resultado: consequencia.resultado,
            pontos: consequencia.pontos
          },
          pontuacao: consequencia.pontos,
          completado: true,
          jogo_id: gameId
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Atualizar progresso local
      setProgressos(prev => [data, ...prev]);
      
      // Mostrar resultado
      setResultado({
        texto: consequencia.resultado,
        pontos: consequencia.pontos
      });
      
      toast.success('Decisão registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar decisão:', error);
      toast.error('Não foi possível registrar sua decisão');
    } finally {
      setIsSubmitting(false);
    }
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
          <TabsTrigger value="cenarios">
            <GitBranch className="h-4 w-4 mr-2" /> 
            Cenários
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="h-4 w-4 mr-2" /> 
            Seu Histórico
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cenarios">
          {cenarios.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Nenhum cenário disponível no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {cenarios.map(cenario => {
                  const jaCompletado = progressos.some(p => p.cenario_id === cenario.id && p.completado);
                  return (
                    <Card 
                      key={cenario.id} 
                      className={`cursor-pointer transition-all ${cenario.id === cenarioSelecionado?.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleCenarioSelecao(cenario)}
                    >
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{cenario.titulo}</CardTitle>
                          {jaCompletado && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm mt-1">Área: {cenario.area_direito}</p>
                        <p className={`text-xs font-medium ${cenario.nivel_dificuldade === 'iniciante' ? 'text-green-600' : cenario.nivel_dificuldade === 'intermediário' ? 'text-amber-600' : 'text-red-600'}`}>
                          Dificuldade: {cenario.nivel_dificuldade}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{cenario.descricao}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {cenarioSelecionado && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>RPG Jurídico: {cenarioSelecionado.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Situação:</h3>
                        <p>{cenarioSelecionado.situacao_inicial}</p>
                      </div>
                      
                      {resultado ? (
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-2">Resultado:</h3>
                          <div className="bg-muted p-4 rounded-md mb-4">
                            <p>{resultado.texto}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>Você ganhou:</span>
                            <span className={`text-xl font-bold ${resultado.pontos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {resultado.pontos} pontos
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-2">O que você fará?</h3>
                          <div className="space-y-2">
                            {cenarioSelecionado.opcoes.map(opcao => (
                              <div 
                                key={opcao.id}
                                onClick={() => handleEscolhaOpcao(opcao.id)}
                                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                  opcaoSelecionada === opcao.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                }`}
                              >
                                {opcao.texto}
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="mt-4" 
                            onClick={handleSubmitEscolha} 
                            disabled={opcaoSelecionada === null || isSubmitting}
                          >
                            {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                            Confirmar Escolha
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="historico">
          {progressos.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Você ainda não participou de nenhum cenário.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {progressos.filter(p => p.completado).map(progresso => {
                const cenarioRelacionado = cenarios.find(c => c.id === progresso.cenario_id);
                return (
                  <Card key={progresso.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{cenarioRelacionado?.titulo || 'Cenário não encontrado'}</CardTitle>
                        <span className="text-lg font-bold">{progresso.pontuacao} pts</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Situação:</h3>
                          <p className="text-sm">{cenarioRelacionado?.situacao_inicial}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Sua escolha:</h3>
                          {cenarioRelacionado?.opcoes.find(o => o.id === progresso.caminho_escolhido?.opcao_id)?.texto}
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-1">Resultado:</h3>
                          <p className="text-sm bg-muted p-3 rounded-md">{progresso.caminho_escolhido?.resultado}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
