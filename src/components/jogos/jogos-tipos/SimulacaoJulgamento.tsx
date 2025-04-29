
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Gavel, FileText, Award, ChevronRight, Lightbulb } from 'lucide-react';

interface SimulacaoJulgamentoProps {
  gameId: string;
}

interface CasoSimulacao {
  id: string;
  titulo: string;
  descricao: string;
  fatos: string;
  provas?: string;
  area_direito: string;
}

interface Submissao {
  id: string;
  papel: string;
  argumentacao: string;
  pontuacao?: number;
  feedback?: string;
}

export const SimulacaoJulgamento = ({ gameId }: SimulacaoJulgamentoProps) => {
  const { user } = useAuth();
  const [casos, setCasos] = useState<CasoSimulacao[]>([]);
  const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);
  const [papel, setPapel] = useState<'defesa' | 'acusacao'>('defesa');
  const [argumentacao, setArgumentacao] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSubmissao, setUserSubmissao] = useState<Submissao | null>(null);
  const [showResultado, setShowResultado] = useState(false);
  
  useEffect(() => {
    const fetchCasos = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_simulacoes_casos')
          .select('*')
          .order('titulo');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCasos(data);
          setSelectedCasoId(data[0].id);
        } else {
          // Criar um caso de exemplo se não houver nenhum
          const mockCaso = {
            id: '1',
            titulo: 'Disputa de Guarda',
            descricao: 'Caso simulado envolvendo uma disputa de guarda entre pais divorciados',
            fatos: 'Os pais, João e Maria, se divorciaram há 2 anos. João alega que Maria tem impedido seu contato com o filho de 7 anos. Maria, por sua vez, alega que João não demonstra interesse pelo filho e tem histórico de não cumprir com suas obrigações parentais. O filho está matriculado em escola próxima à residência da mãe e tem rotina estável.',
            provas: 'Histórico escolar da criança; Registros de pagamentos de pensão alimentícia; Depoimentos de familiares; Relatório de assistente social.',
            area_direito: 'Direito de Família'
          };
          
          setCasos([mockCaso as any]);
          setSelectedCasoId(mockCaso.id);
        }
      } catch (error) {
        console.error('Erro ao carregar casos:', error);
        toast.error('Não foi possível carregar os casos para simulação');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCasos();
  }, []);
  
  useEffect(() => {
    if (!user || !selectedCasoId) return;
    
    const checkUserSubmissao = async () => {
      try {
        // Check if user has submitted for this case already
        const { data, error } = await supabase
          .from('jogos_simulacoes_submissoes')
          .select('*')
          .eq('user_id', user.id)
          .eq('caso_id', selectedCasoId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data) {
          setUserSubmissao(data);
          setPapel(data.papel as 'defesa' | 'acusacao');
          setArgumentacao(data.argumentacao);
          if (data.pontuacao !== null) {
            setShowResultado(true);
          }
        } else {
          setUserSubmissao(null);
          setArgumentacao('');
          setShowResultado(false);
        }
      } catch (error) {
        console.error('Erro ao verificar submissão do usuário:', error);
      }
    };
    
    checkUserSubmissao();
  }, [user, selectedCasoId]);
  
  const handleSubmit = async () => {
    if (!user || !selectedCasoId || argumentacao.trim().length < 100) {
      toast.error('Por favor, escreva uma argumentação mais completa antes de enviar');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit case
      const { data: submissaoData, error: submissaoError } = await supabase
        .from('jogos_simulacoes_submissoes')
        .insert({
          user_id: user.id,
          caso_id: selectedCasoId,
          papel,
          argumentacao,
        })
        .select('*')
        .single();
      
      if (submissaoError) throw submissaoError;
      
      setUserSubmissao(submissaoData);
      
      // Get AI feedback (simulated for now)
      // In a real implementation, this would call an AI edge function
      setTimeout(async () => {
        const pontuacao = Math.floor(Math.random() * 21) + 70; // 70-90 pts
        const feedbacks = [
          'Boa argumentação! Você abordou os pontos principais do caso e construiu argumentos sólidos.',
          'Argumentação coerente, mas poderia explorar melhor os aspectos jurídicos específicos.',
          'Excelente uso dos fatos para construir seus argumentos. Sua peça está bem fundamentada.',
          'Você demonstrou conhecimento jurídico, mas poderia melhorar a estrutura da argumentação.'
        ];
        
        const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        
        // Update submission with feedback and score
        const { error: updateError } = await supabase
          .from('jogos_simulacoes_submissoes')
          .update({
            pontuacao,
            feedback
          })
          .eq('id', submissaoData.id);
        
        if (updateError) throw updateError;
        
        // Update user stats
        await updateUserStats(pontuacao);
        
        // Update submission state
        setUserSubmissao({
          ...submissaoData,
          pontuacao,
          feedback
        });
        
        setShowResultado(true);
        toast.success('Sua argumentação foi avaliada!');
      }, 2000);
      
      toast.success('Argumentação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar argumentação:', error);
      toast.error('Não foi possível enviar sua argumentação');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateUserStats = async (pontuacao: number) => {
    if (!user) return;
    
    try {
      // Check if stats exist for this game
      const { data, error } = await supabase
        .from('jogos_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('jogo_id', gameId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      const currentStats = data || {
        user_id: user.id,
        jogo_id: gameId,
        pontuacao: 0,
        partidas_jogadas: 0,
        partidas_vencidas: 0,
        melhor_resultado: 0
      };
      
      // Update stats
      if (data) {
        await supabase
          .from('jogos_user_stats')
          .update({
            pontuacao: currentStats.pontuacao + pontuacao,
            partidas_jogadas: currentStats.partidas_jogadas + 1,
            melhor_resultado: Math.max(currentStats.melhor_resultado, pontuacao),
            ultimo_acesso: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('jogo_id', gameId);
      } else {
        await supabase
          .from('jogos_user_stats')
          .insert({
            user_id: user.id,
            jogo_id: gameId,
            pontuacao,
            partidas_jogadas: 1,
            partidas_vencidas: 0,
            melhor_resultado: pontuacao
          });
      }
      
      // Add to leaderboard
      await supabase
        .from('jogos_leaderboards')
        .insert({
          user_id: user.id,
          jogo_id: gameId,
          pontuacao
        });
      
      // Award badges for high scores
      if (pontuacao >= 85) {
        await supabase
          .from('jogos_user_badges')
          .upsert({
            user_id: user.id,
            jogo_id: gameId,
            badge_nome: 'Advogado Maestro',
            badge_descricao: 'Conseguiu uma pontuação acima de 85 em uma Simulação de Julgamento',
            badge_icone: 'gavel'
          }, {
            onConflict: 'user_id,jogo_id,badge_nome'
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };
  
  const handleCasoSelect = (casoId: string) => {
    setSelectedCasoId(casoId);
  };
  
  const resetSimulacao = () => {
    setShowResultado(false);
    setArgumentacao('');
    setPapel('defesa');
    setUserSubmissao(null);
  };
  
  const selectedCaso = casos.find(caso => caso.id === selectedCasoId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (showResultado && userSubmissao) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Resultado da Avaliação</h2>
          <p className="text-muted-foreground">
            Sua argumentação para {selectedCaso?.titulo} foi avaliada
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 bg-muted/30 p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Sua Argumentação ({papel === 'defesa' ? 'Defesa' : 'Acusação'})
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{userSubmissao.argumentacao}</p>
            </div>
          </div>
          
          <div className="w-full md:w-64 flex flex-col gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border text-center">
              <h3 className="text-lg font-medium mb-2">Pontuação</h3>
              <div className="text-5xl font-bold text-primary">
                {userSubmissao.pontuacao}
              </div>
              <p className="text-xs text-muted-foreground mt-2">de 100 pontos</p>
            </div>
            
            {userSubmissao.feedback && (
              <div className="bg-muted/30 p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                  Feedback
                </h3>
                <p className="text-sm">{userSubmissao.feedback}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={resetSimulacao}>
            Nova Simulação
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {casos.map((caso) => (
          <div
            key={caso.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedCasoId === caso.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleCasoSelect(caso.id)}
          >
            <h3 className="font-medium mb-1">{caso.titulo}</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {caso.area_direito}
            </p>
            <p className="text-sm line-clamp-2">
              {caso.descricao}
            </p>
          </div>
        ))}
      </div>
      
      {selectedCaso && (
        <>
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">{selectedCaso.titulo}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedCaso.area_direito}
            </p>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3>Fatos</h3>
              <p className="whitespace-pre-wrap">{selectedCaso.fatos}</p>
              
              {selectedCaso.provas && (
                <>
                  <h3>Provas Disponíveis</h3>
                  <p className="whitespace-pre-wrap">{selectedCaso.provas}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Escolha seu papel:</h3>
            <Tabs defaultValue={papel} onValueChange={(value) => setPapel(value as 'defesa' | 'acusacao')}>
              <TabsList className="w-full">
                <TabsTrigger value="defesa" className="flex-1">
                  Defesa
                </TabsTrigger>
                <TabsTrigger value="acusacao" className="flex-1">
                  Acusação
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="mb-6">
            <label className="block font-medium mb-2">
              Escreva sua argumentação como {papel === 'defesa' ? 'advogado de defesa' : 'promotor'}:
            </label>
            <Textarea
              placeholder="Comece sua argumentação aqui..."
              value={argumentacao}
              onChange={(e) => setArgumentacao(e.target.value)}
              className="min-h-[200px] font-mono"
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Mínimo 100 caracteres
              </div>
              <div className={`text-sm ${argumentacao.length < 100 ? 'text-red-500' : 'text-green-500'}`}>
                {argumentacao.length} caracteres
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={argumentacao.trim().length < 100 || isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Argumentação
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
