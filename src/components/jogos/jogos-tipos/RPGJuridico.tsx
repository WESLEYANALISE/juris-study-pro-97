import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Map, MapPin, Sparkles } from 'lucide-react';
import { Cenario, ProgressoRPG } from '@/types/jogos';

interface RPGJuridicoProps {
  gameId: string;
}

export const RPGJuridico = ({ gameId }: RPGJuridicoProps) => {
  const { user } = useAuth();
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [cenarioAtual, setCenarioAtual] = useState<Cenario | null>(null);
  const [progresso, setProgresso] = useState<ProgressoRPG | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caminhoEscolhido, setCaminhoEscolhido] = useState<string | null>(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [historiaCenario, setHistoriaCenario] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCenarios = async () => {
      try {
        setIsLoading(true);
        
        // Using the standard supabase client instead of the custom one
        const { data, error } = await supabase
          .from('jogos_rpg_cenarios')
          .select('*');
        
        if (error) throw error;
        
        // Type assertion for the data
        const cenariosData = data as unknown as Cenario[];
        setCenarios(cenariosData);
        
        // If there's only one scenario, select it automatically
        if (cenariosData && cenariosData.length > 0) {
          setCenarioAtual(cenariosData[0]);
        }
        
        if (user) {
          // Check user progress
          const { data: progressoData, error: progressoError } = await supabase
            .from('jogos_rpg_progresso')
            .select('*')
            .eq('user_id', user.id)
            .eq('cenario_id', cenariosData[0]?.id)
            .maybeSingle();
            
          if (!progressoError && progressoData) {
            // Type assertion
            const progressoTyped = progressoData as unknown as ProgressoRPG;
            setProgresso(progressoTyped);
            
            // Handle caminho_escolhido if present
            const caminhoEscolhidoData = progressoTyped.caminho_escolhido;
            if (caminhoEscolhidoData) {
              // Convert JSON string to object if it's a string
              try {
                const caminhoObj = typeof caminhoEscolhidoData === 'string' 
                  ? JSON.parse(caminhoEscolhidoData) 
                  : caminhoEscolhidoData;
                setCaminhoEscolhido(caminhoObj.opcao || null);
                setEtapaAtual(caminhoObj.etapa || 0);
                setHistoriaCenario(caminhoObj.historia || []);
              } catch (e) {
                console.error('Error processing history:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading scenarios:', error);
        toast.error('Unable to load scenarios');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCenarios();
  }, [user]);
  
  const handleSelecionarCenario = (cenario: Cenario) => {
    setCenarioAtual(cenario);
    setEtapaAtual(0);
    setCaminhoEscolhido(null);
    setHistoriaCenario([cenario.situacao_inicial]);
  };
  
  const handleEscolherCaminho = async (opcao: string) => {
    if (!cenarioAtual || !user) return;
    
    // Add option to history
    const novaEtapa = etapaAtual + 1;
    const consequencia = cenarioAtual.consequencias[opcao];
    const novaHistoria = [...historiaCenario, consequencia];
    
    setHistoriaCenario(novaHistoria);
    setCaminhoEscolhido(opcao);
    setEtapaAtual(novaEtapa);
    
    const finalizado = novaEtapa >= 3; // Example: 3 steps complete the scenario
    
    try {
      // Record progress
      const caminhoObj = {
        opcao,
        etapa: novaEtapa,
        historia: novaHistoria
      };
      
      // Calculate score based on choice
      const pontuacao = opcao === 'A' ? 10 : opcao === 'B' ? 5 : 3; // Simple example
      
      // Use the standard supabase client instead of supabaseWithCustomTables
      const { data, error } = await supabase
        .from('jogos_rpg_progresso')
        .upsert({
          user_id: user.id,
          cenario_id: cenarioAtual.id,
          caminho_escolhido: JSON.stringify(caminhoObj),
          pontuacao: pontuacao,
          completado: finalizado,
          jogo_id: gameId
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setProgresso(data[0] as unknown as ProgressoRPG);
      }
      
      if (finalizado) {
        toast.success('Scenario completed! Score recorded.');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Unable to save your progress');
    }
  };
  
  const renderOpcoes = () => {
    if (!cenarioAtual || etapaAtual >= 3) return null;
    
    const opcoes = cenarioAtual.opcoes;
    return (
      <div className="mt-6 space-y-4">
        <h4 className="font-medium text-lg">What do you decide to do?</h4>
        <div className="grid gap-3">
          {Object.entries(opcoes).map(([key, opcao]) => (
            <Button 
              key={key}
              variant="outline"
              className="justify-start h-auto py-3 px-4 text-left"
              onClick={() => handleEscolherCaminho(key)}
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{opcao}</span>
            </Button>
          ))}
        </div>
      </div>
    );
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Map className="mr-2 h-6 w-6" />
          Legal Scenarios
        </h2>
        <p className="text-muted-foreground">
          Explore legal situations and make decisions as a legal professional.
        </p>
      </div>
      
      {!cenarioAtual ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cenarios.map(cenario => (
            <Card 
              key={cenario.id} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleSelecionarCenario(cenario)}
            >
              <CardHeader>
                <CardTitle>{cenario.titulo}</CardTitle>
                <p className={`text-xs font-medium ${
                  cenario.nivel_dificuldade === 'iniciante' ? 'text-green-600' : 
                  cenario.nivel_dificuldade === 'intermediário' ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  Difficulty: {cenario.nivel_dificuldade}
                </p>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{cenario.descricao}</CardDescription>
                <p className="text-sm">Area: {cenario.area_direito}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{cenarioAtual.titulo}</CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Area: {cenarioAtual.area_direito}</p>
              {progresso?.completado && (
                <div className="flex items-center text-amber-600">
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span className="font-medium">{progresso.pontuacao} points</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Scenario history */}
              <div className="space-y-4">
                {historiaCenario.map((texto, i) => (
                  <div key={i} className={`p-4 rounded-lg ${i % 2 === 0 ? 'bg-muted' : 'border'}`}>
                    <p>{texto}</p>
                  </div>
                ))}
              </div>
              
              {/* Decision options */}
              {renderOpcoes()}
              
              {/* Completed scenario */}
              {etapaAtual >= 3 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-bold flex items-center mb-2">
                    <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                    Scenario Completed!
                  </h3>
                  <p>You completed this legal scenario and earned {progresso?.pontuacao || 0} points.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setCenarioAtual(null)}
                  >
                    Return to Scenarios
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RPGJuridico;
