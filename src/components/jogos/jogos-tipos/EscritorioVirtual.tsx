import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Briefcase, Files, CheckCircle2, Clock } from 'lucide-react';
import { Caso, Solucao } from '@/types/jogos';

interface EscritorioVirtualProps {
  gameId: string;
}

export const EscritorioVirtual = ({ gameId }: EscritorioVirtualProps) => {
  const { user } = useAuth();
  const [casos, setCasos] = useState<Caso[]>([]);
  const [solucoes, setSolucoes] = useState<Solucao[]>([]);
  const [casoSelecionado, setCasoSelecionado] = useState<Caso | null>(null);
  const [solucaoTexto, setSolucaoTexto] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('casos');
  
  useEffect(() => {
    const fetchCasos = async () => {
      try {
        setIsLoading(true);
        
        // Use the any type and explicit casting to avoid type errors
        const { data: casosData, error: casosError } = await supabase
          .from('jogos_escritorio_casos')
          .select('*')
          .order('created_at', { ascending: false }) as { data: Caso[] | null, error: any };
          
        if (casosError) throw casosError;
        setCasos(casosData || []);
        
        if (user) {
          const { data: solucoesData, error: solucoesError } = await supabase
            .from('jogos_escritorio_solucoes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }) as { data: Solucao[] | null, error: any };
            
          if (solucoesError) throw solucoesError;
          setSolucoes(solucoesData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar casos:', error);
        toast.error('Não foi possível carregar os casos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCasos();
  }, [user]);
  
  const handleCasoSelecao = (caso: Caso) => {
    setCasoSelecionado(caso);
    // Verificar se usuário já submeteu solução para este caso
    const solucaoExistente = solucoes.find(s => s.caso_id === caso.id);
    if (solucaoExistente) {
      setSolucaoTexto(solucaoExistente.solucao);
    } else {
      setSolucaoTexto('');
    }
  };
  
  const handleSubmitSolucao = async () => {
    if (!user || !casoSelecionado) return;
    
    if (solucaoTexto.trim().length < 50) {
      toast.error('Sua solução deve ter pelo menos 50 caracteres');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Verificar se já existe solução
      const solucaoExistente = solucoes.find(s => s.caso_id === casoSelecionado.id);
      
      if (solucaoExistente) {
        toast.error('Você já submeteu uma solução para este caso');
        return;
      }
      
      const { data, error } = await supabase
        .from('jogos_escritorio_solucoes')
        .insert({
          caso_id: casoSelecionado.id,
          user_id: user.id,
          solucao: solucaoTexto,
          jogo_id: gameId
        })
        .select('*')
        .single() as { data: Solucao | null, error: any };
        
      if (error) throw error;
      
      if (data) {
        // Adicionar nova solução à lista local
        setSolucoes(prev => [data, ...prev]);
        toast.success('Solução submetida com sucesso!');
        setActiveTab('solucoes');
      }
    } catch (error) {
      console.error('Erro ao submeter solução:', error);
      toast.error('Não foi possível submeter sua solução');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <span className="flex items-center text-green-600"><CheckCircle2 className="h-4 w-4 mr-1" /> Aprovada</span>;
      case 'reprovada':
        return <span className="flex items-center text-red-600"><CheckCircle2 className="h-4 w-4 mr-1" /> Reprovada</span>;
      default:
        return <span className="flex items-center text-amber-600"><Clock className="h-4 w-4 mr-1" /> Pendente</span>;
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
          <TabsTrigger value="casos">
            <Files className="h-4 w-4 mr-2" /> 
            Casos Disponíveis
          </TabsTrigger>
          <TabsTrigger value="solucoes">
            <Briefcase className="h-4 w-4 mr-2" /> 
            Minhas Soluções
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="casos">
          {casos.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Nenhum caso disponível no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {casos.map(caso => (
                  <Card 
                    key={caso.id} 
                    className={`cursor-pointer transition-all ${caso.id === casoSelecionado?.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleCasoSelecao(caso)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{caso.titulo}</CardTitle>
                      <p className="text-sm mt-1">Cliente: {caso.cliente}</p>
                      <p className={`text-xs font-medium ${caso.nivel_dificuldade === 'iniciante' ? 'text-green-600' : caso.nivel_dificuldade === 'intermediário' ? 'text-amber-600' : 'text-red-600'}`}>
                        Dificuldade: {caso.nivel_dificuldade}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{caso.descricao}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {casoSelecionado && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Detalhes do Caso: {casoSelecionado.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Problema:</h3>
                        <p>{casoSelecionado.problema}</p>
                      </div>
                      
                      {/* Formulário de solução */}
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-2">Sua Solução:</h3>
                        <Textarea 
                          value={solucaoTexto}
                          onChange={(e) => setSolucaoTexto(e.target.value)}
                          placeholder="Escreva sua solução jurídica para este caso..."
                          className="min-h-[150px] mb-2"
                        />
                        <Button 
                          onClick={handleSubmitSolucao} 
                          disabled={isSubmitting || solucaoTexto.trim().length < 50}
                        >
                          {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                          Submeter Solução
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="solucoes">
          {solucoes.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p>Você ainda não submeteu soluções para nenhum caso.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {solucoes.map(solucao => {
                const casoRelacionado = casos.find(c => c.id === solucao.caso_id);
                return (
                  <Card key={solucao.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{casoRelacionado?.titulo || 'Caso não encontrado'}</CardTitle>
                        {getStatusBadge(solucao.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Sua solução:</h3>
                          <p className="text-sm bg-muted p-3 rounded-md">{solucao.solucao}</p>
                        </div>
                        
                        {solucao.feedback && (
                          <div>
                            <h3 className="font-medium mb-1">Feedback:</h3>
                            <p className="text-sm bg-muted p-3 rounded-md">{solucao.feedback}</p>
                          </div>
                        )}
                        
                        {solucao.status !== 'pendente' && (
                          <div className="flex items-center justify-end">
                            <span className="font-medium mr-2">Pontuação:</span>
                            <span className="text-lg font-bold">{solucao.pontuacao}</span>
                          </div>
                        )}
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
