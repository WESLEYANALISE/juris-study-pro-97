import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { CalendarDays, CalendarClock, Calendar, Download, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CronogramaEstudosProps {
  userId: string | null;
}

// Define interfaces for our data
interface PlanoEstudo {
  id?: string;
  user_id: string;
  tipo_plano: string;
  tempo_disponivel: string;
  criado_em: string;
  ultima_atualizacao: string;
}

export const CronogramaEstudos = ({ userId }: CronogramaEstudosProps) => {
  const [tipoPlano, setTipoPlano] = useState('basico');
  const [tempoDisponivel, setTempoDisponivel] = useState('pouco');
  const [planoGerado, setPlanoGerado] = useState(false);
  const [planoSalvo, setPlanoSalvo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingPlan, setExistingPlan] = useState<PlanoEstudo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's existing plan if available
  useEffect(() => {
    const fetchExistingPlan = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Use a more generic query approach without type checking
        const { data, error } = await supabase
          .from('plano_estudos')
          .select('*')
          .eq('user_id', userId)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching study plan:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar seu plano de estudos',
            variant: 'destructive'
          });
        }
        
        if (data) {
          setExistingPlan(data as PlanoEstudo);
          setTipoPlano(data.tipo_plano || 'basico');
          setTempoDisponivel(data.tempo_disponivel || 'pouco');
          setPlanoGerado(true);
          setPlanoSalvo(true);
        }
      } catch (error) {
        console.error('Error in fetchExistingPlan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingPlan();
  }, [userId, toast]);

  const handleGerarPlano = () => {
    setPlanoGerado(true);
    setPlanoSalvo(false);
  };
  
  const handleSalvarPlano = async () => {
    if (!userId) {
      toast({
        title: 'É necessário estar logado',
        description: 'Faça login para salvar seu plano de estudos',
        variant: 'default'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const planoData: PlanoEstudo = {
        user_id: userId,
        tipo_plano: tipoPlano,
        tempo_disponivel: tempoDisponivel,
        criado_em: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString()
      };
      
      // Use a more generic approach without strict type checking
      const { error } = await supabase
        .from('plano_estudos')
        .insert(planoData);
        
      if (error) {
        console.error('Error saving study plan:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar seu plano de estudos',
          variant: 'destructive'
        });
        return;
      }
      
      setPlanoSalvo(true);
      toast({
        title: 'Plano salvo',
        description: 'Seu plano de estudos foi salvo com sucesso',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error in handleSalvarPlano:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar seu plano',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Cronograma de Estudos</h2>
        <p className="text-muted-foreground">
          Crie um plano de estudos personalizado para organizar seus estudos jurídicos.
        </p>
      </div>

      {!planoGerado ? (
        <Card>
          <CardHeader>
            <CardTitle>Configure seu plano de estudos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium">Tipo de plano</h3>
              <RadioGroup
                defaultValue="basico"
                value={tipoPlano}
                onValueChange={setTipoPlano}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basico" id="basico" />
                  <Label htmlFor="basico">Básico: Fundamentos do Direito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oab" id="oab" />
                  <Label htmlFor="oab">Preparatório OAB</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="concursos" id="concursos" />
                  <Label htmlFor="concursos">Concursos Públicos</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Tempo disponível</h3>
              <RadioGroup
                defaultValue="pouco"
                value={tempoDisponivel}
                onValueChange={setTempoDisponivel}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pouco" id="pouco" />
                  <Label htmlFor="pouco">Pouco tempo (30min/dia)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medio" id="medio" />
                  <Label htmlFor="medio">Tempo médio (1-2h/dia)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muito" id="muito" />
                  <Label htmlFor="muito">Dedicação exclusiva (4h+/dia)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGerarPlano} className="w-full">
              Gerar Meu Plano de Estudos
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Seu Plano de Estudos Personalizado</CardTitle>
                {planoSalvo && <Check className="h-5 w-5 text-green-500" />}
              </div>
              {existingPlan && (
                <p className="text-sm text-muted-foreground">
                  Criado em {format(new Date(existingPlan.criado_em), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="py-2 px-4 bg-primary/10 rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {tipoPlano === 'basico' && "Plano: Fundamentos do Direito"}
                      {tipoPlano === 'oab' && "Plano: Preparatório OAB"}
                      {tipoPlano === 'concursos' && "Plano: Concursos Públicos"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {tempoDisponivel === 'pouco' && "Dedicação: 30min/dia"}
                      {tempoDisponivel === 'medio' && "Dedicação: 1-2h/dia"}
                      {tempoDisponivel === 'muito' && "Dedicação: 4h+/dia"}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Semana 1-2: Fundamentos</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                    <li>Introdução ao Estudo do Direito (conceitos básicos)</li>
                    <li>Princípios fundamentais da Constituição</li>
                    <li>Organização do Estado e dos Poderes</li>
                    <li>Leitura guiada: primeiros artigos da Constituição</li>
                    <li>Prática: 5 questões básicas diárias</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Semana 3-4: Direito Civil</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                    <li>Parte Geral: Pessoas naturais e jurídicas</li>
                    <li>Bens e fatos jurídicos</li>
                    <li>Leitura guiada: primeiros artigos do Código Civil</li>
                    <li>Prática: casos concretos simples</li>
                    {tempoDisponivel !== 'pouco' && (
                      <li>Assistir videoaulas sobre negócios jurídicos</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Semana 5-6: Direito Penal</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                    <li>Princípios do Direito Penal</li>
                    <li>Aplicação da lei penal</li>
                    <li>Conceito de crime</li>
                    <li>Prática: identificar crimes em notícias</li>
                    {tempoDisponivel === 'muito' && (
                      <li>Análise de jurisprudência básica</li>
                    )}
                  </ul>
                </div>

                {tempoDisponivel !== 'pouco' && (
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>Semana 7-8: Processo Civil</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                      <li>Noções de jurisdição e ação</li>
                      <li>Partes e procuradores</li>
                      <li>Prática: analisar estrutura de uma petição inicial</li>
                      {tempoDisponivel === 'muito' && (
                        <li>Simulação de um processo simples</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!userId}
              >
                <CalendarClock className="h-4 w-4" />
                Adicionar ao Cronograma
              </Button>
              
              {!planoSalvo ? (
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleSalvarPlano}
                  disabled={isSaving || !userId}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Salvar Plano
                    </>
                  )}
                </Button>
              ) : (
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="bg-card p-4 rounded-md border border-border">
            <h4 className="font-medium mb-2">Dicas para aproveitar seu plano</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              <li>Estude no mesmo horário todos os dias para criar um hábito</li>
              <li>Intercale teoria com prática para fixar o conteúdo</li>
              <li>Faça resumos do que estudou ao final de cada semana</li>
              <li>Use a técnica pomodoro: estudos de 25 minutos com pausas de 5 minutos</li>
              <li>Revise periodicamente o conteúdo já estudado</li>
            </ul>
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={() => setPlanoGerado(false)} className="w-full">
              Personalizar outro plano
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
