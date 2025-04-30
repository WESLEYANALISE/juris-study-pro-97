
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { MessageSquare, FileText, BarChart3 } from 'lucide-react';
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
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    const fetchCasos = async () => {
      try {
        setIsLoading(true);
        
        // Use the standard supabase client with type assertion
        const { data: casosData, error: casosError } = await supabase
          .from('jogos_escritorio_casos' as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (casosError) throw casosError;
        
        setCasos(casosData as unknown as Caso[]);
        
        if (user) {
          const { data: solucoesData, error: solucoesError } = await supabase
            .from('jogos_escritorio_solucoes' as any)
            .select('*')
            .eq('user_id', user.id);
          
          if (solucoesError) throw solucoesError;
          
          setSolucoes(solucoesData as unknown as Solucao[]);
        }
      } catch (error) {
        console.error('Erro ao carregar casos:', error);
        toast.error('Não foi possível carregar os casos do escritório virtual');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCasos();
  }, [user]);
  
  const handleSubmitSolucao = async () => {
    if (!user || !casoSelecionado) return;
    if (solucaoTexto.trim().length < 50) {
      toast.error('Sua solução deve ter pelo menos 50 caracteres');
      return;
    }
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('jogos_escritorio_solucoes' as any)
        .insert({
          caso_id: casoSelecionado.id,
          user_id: user.id,
          solucao: solucaoTexto,
          status: 'pendente'
        });
      
      if (error) throw error;
      
      toast.success('Solução enviada com sucesso!');
      setSolucaoTexto('');
      setCasoSelecionado(null);
      
      // Refresh soluções
      const { data, error: fetchError } = await supabase
        .from('jogos_escritorio_solucoes' as any)
        .select('*')
        .eq('user_id', user.id);
      
      if (!fetchError && data) {
        setSolucoes(data as unknown as Solucao[]);
      }
      
      // Update user stats
      await supabase.from('jogos_user_stats' as any).upsert({
        user_id: user.id,
        jogo_id: gameId,
        partidas_jogadas: (solucoes.length || 0) + 1,
        pontuacao: (solucoes.length || 0) + 1 * 10,
        ultimo_acesso: new Date().toISOString()
      }, { onConflict: 'user_id, jogo_id' });
      
    } catch (error) {
      console.error('Erro ao enviar solução:', error);
      toast.error('Não foi possível enviar sua solução');
    } finally {
      setIsSending(false);
    }
  };
  
  const getSolucaoStatus = (status?: string) => {
    switch(status) {
      case 'aprovado': return <span className="text-green-600 font-medium">Aprovada</span>;
      case 'reprovado': return <span className="text-red-600 font-medium">Reprovada</span>;
      default: return <span className="text-amber-600 font-medium">Em análise</span>;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              <MessageSquare className="h-5 w-5 mr-2 inline-block" />
              Casos disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {casos.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum caso disponível no momento.</p>
            ) : (
              <ul className="space-y-2">
                {casos.map(caso => (
                  <li 
                    key={caso.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-secondary ${casoSelecionado?.id === caso.id ? 'bg-secondary/80' : ''}`}
                    onClick={() => setCasoSelecionado(caso)}
                  >
                    <h4 className="font-medium">{caso.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{caso.descricao.substring(0, 50)}...</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        {solucoes.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-md font-bold">
                <BarChart3 className="h-4 w-4 mr-2 inline-block" />
                Suas soluções
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[250px] overflow-y-auto">
              <ul className="space-y-2">
                {solucoes.map(solucao => (
                  <li key={solucao.id} className="p-3 rounded-md bg-muted">
                    <p className="text-sm">
                      <strong>Caso ID:</strong> {solucao.caso_id}
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong> {getSolucaoStatus(solucao.status)}
                    </p>
                    {solucao.feedback && (
                      <p className="text-sm">
                        <strong>Feedback:</strong> {solucao.feedback}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="col-span-1">
        {casoSelecionado ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                <FileText className="h-5 w-5 mr-2 inline-block" />
                {casoSelecionado.titulo}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Cliente: {casoSelecionado.cliente}</p>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                <strong>Problema:</strong> {casoSelecionado.problema}
              </p>
              <p className="mb-4">
                <strong>Descrição:</strong> {casoSelecionado.descricao}
              </p>
              <Textarea 
                placeholder="Escreva sua solução aqui..." 
                value={solucaoTexto}
                onChange={(e) => setSolucaoTexto(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="secondary" onClick={() => setCasoSelecionado(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitSolucao}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    Enviando...
                    <LoadingSpinner size="sm" className="ml-2" />
                  </>
                ) : 'Enviar Solução'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center p-8">
              <p>Selecione um caso para visualizar os detalhes e enviar sua solução.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
