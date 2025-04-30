
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { GitBranch, History, Trophy, CheckCircle2 } from 'lucide-react';
import { Cenario, ProgressoRPG } from '@/types/jogos';

interface RPGJuridicoProps {
  gameId: string;
}

export const RPGJuridico = ({ gameId }: RPGJuridicoProps) => {
  const { user } = useAuth();
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [progressoUsuario, setProgressoUsuario] = useState<ProgressoRPG[]>([]);
  const [cenarioSelecionado, setCenarioSelecionado] = useState<Cenario | null>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<any | null>(null);
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
          .order('titulo');
          
        if (cenariosError) throw cenariosError;
        setCenarios(cenariosData as Cenario[] || []);
        
        if (user) {
          const { data: progressoData, error: progressoError } = await supabase
            .from('jogos_rpg_progresso')
            .select('*')
            .eq('user_id', user.id);
            
          if (progressoError) throw progressoError;
          setProgressoUsuario(progressoData as ProgressoRPG[] || []);
        }
      } catch (error) {
        console.error('Erro ao carregar cenários RPG:', error);
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
    const progressoExistente = progressoUsuario.find(p => p.cenario_id === cenario.id);
    if (progressoExistente && progressoExistente.completado) {
      toast.info('Você já completou este cenário!');
    }
  };
  
  const handleSubmitEscolha = async () => {
    if (!user || !cenarioSelecionado || opcaoSelecionada === null) return;
    
    try {
      setIsSubmitting(true);
      
      const opcoes = cenarioSelecionado.opcoes as any[];
      const consequencias = cenarioSelecionado.consequencias as any[];
      
      // Encontrar resultado baseado na opção selecionada
      const consequencia = consequencias.find(c => c.opcao_id === opcaoSelecionada);
      
      if (!consequencia) {
        toast.error('Erro ao processar sua escolha');
        return;
      }
      
      setResultado(consequencia);
      
      const { data, error } = await supabase
        .from('jogos_rpg_progresso')
        .insert({
          cenario_id: cenarioSelecionado.id,
          user_id: user.id,
          caminho_escolhido: { opcao_id: opcaoSelecionada },
          pontuacao: consequencia.pontos,
          completado: true,
          jogo_id: gameId
        })
        .select('*')
        .single();
        
      if (error) {
        // Checar se é erro de chave duplicada (já completou este cenário)
        if (error.code === '23505') {
          toast.info('Você já completou este cenário antes');
        } else {
          throw error;
        }
      }
      
      if (data) {
        // Atualizar progresso local
        setProgressoUsuario(prev => [data as ProgressoRPG, ...prev]);
        toast.success(`Você ganhou ${consequencia.pontos} pontos!`);
      }
    } catch (error) {
      console.error('Erro ao registrar escolha:', error);
      toast.error('Não foi possível registrar sua escolha');
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
            Histórico
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
                  const jaConcluido = progressoUsuario.some(p => 
                    p.cenario_id === cenario.id && p.completado);
                  
                  return (
                    <Card 
                      key={cenario.id} 
                      className={`cursor-pointer transition-all ${cenario.id === cenarioSelecionado?.id ? 'ring-2 ring-primary' : ''} ${jaConcluido ? 'bg-primary-foreground/10' : ''}`}
                      onClick={() => handleCenarioSelecao(cenario)}
                    >
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cenario.titulo}</CardTitle>
                          <p className="text-sm mt-1">Área: {cenario.area_direito}</p>
                          <p className={`text-xs font-medium ${cenario.nivel_dificuldade === 'iniciante' ? 'text-green-600' : cenario.nivel_dificuldade === 'intermediário' ? 'text-amber-600' : 'text-red-600'}`}>
                            Dificuldade: {cenario.nivel_dificuldade}
                          </p>
                        </div>
                        {jaConcluido && (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Concluído
                          </span>
                        )}
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
                    <CardTitle>{cenarioSelecionado.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-2">Situação:</h3>
                        <p>{cenarioSelecionado.situacao_inicial}</p>
                      </div>
                      
                      {!resultado ? (
                        <>
                          <div className="pt-4">
                            <h3 className="text-lg font-medium mb-3">O que você faria?</h3>
                            <RadioGroup value={opcaoSelecionada?.toString()} onValueChange={val => setOpcaoSelecionada(parseInt(val))}>
                              {(cenarioSelecionado.opcoes as any[]).map((opcao) => (
                                <div className="flex items-center space-x-2 mb-2" key={opcao.id}>
                                  <RadioGroupItem value={opcao.id.toString()} id={`option-${opcao.id}`} />
                                  <Label htmlFor={`option-${opcao.id}`} className="text-base">{opcao.texto}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                            
                            <Button 
                              onClick={handleSubmitEscolha} 
                              disabled={isSubmitting || opcaoSelecionada === null}
                              className="mt-4"
                            >
                              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                              Tomar Decisão
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-primary/10 p-4 rounded-md">
                          <h3 className="text-lg font-medium mb-2">Resultado:</h3>
                          <p>{resultado.resultado}</p>
                          <div className="mt-4 flex items-center">
                            <Trophy className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-bold">{resultado.pontos} pontos</span>
                          </div>
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
          {progressoUsuario.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Você ainda não completou nenhum cenário.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {progressoUsuario.map(progresso => {
                const cenarioRelacionado = cenarios.find(c => c.id === progresso.cenario_id);
                if (!cenarioRelacionado) return null;
                
                return (
                  <Card key={progresso.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{cenarioRelacionado.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Pontuação obtida:</span>
                          <span className="font-bold">{progresso.pontuacao} pontos</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleCenarioSelecao(cenarioRelacionado);
                            setActiveTab('cenarios');
                          }}
                        >
                          Revisitar Cenário
                        </Button>
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
