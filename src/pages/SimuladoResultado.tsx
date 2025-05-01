import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, ArrowRight, FilePlus, Share2, TrendingUp, BookOpen, Video } from "lucide-react";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const SimuladoResultado = () => {
  const { sessaoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sessao, setSessao] = useState<any>(null);
  const [respostas, setRespostas] = useState<any[]>([]);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [areaStats, setAreaStats] = useState<{area: string, acertos: number, total: number}[]>([]);
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const fetchResultados = async () => {
      if (!sessaoId) return;
      
      try {
        // Fetch session details
        const { data: sessaoData, error: sessaoError } = await supabase
          .from('simulado_sessoes')
          .select('*')
          .eq('id', sessaoId)
          .single();
          
        if (sessaoError) throw sessaoError;
        if (!sessaoData) {
          toast({
            title: "Erro",
            description: "Sessão não encontrada",
            variant: "destructive"
          });
          navigate("/simulados");
          return;
        }
        
        setSessao(sessaoData);
        
        // Fetch responses with questions
        const { data: respostasData, error: respostasError } = await supabase
          .from('simulado_respostas')
          .select('*')
          .eq('sessao_id', sessaoId);
          
        if (respostasError) throw respostasError;
        setRespostas(respostasData || []);
        
        // Determine which table to query based on category
        let tableName;
        switch(sessaoData.categoria) {
          case 'OAB': tableName = 'simulados_oab'; break;
          case 'PRF': tableName = 'simulados_prf'; break;
          case 'PF': tableName = 'simulados_pf'; break;
          case 'TJSP': tableName = 'simulados_tjsp'; break;
          case 'JUIZ': tableName = 'simulados_juiz'; break;
          case 'PROMOTOR': tableName = 'simulados_promotor'; break;
          case 'DELEGADO': tableName = 'simulados_delegado'; break;
          default: tableName = 'simulados_oab';
        }
        
        // Extract question IDs from responses
        const questaoIds = respostasData?.map(r => r.questao_id) || [];
        
        if (questaoIds.length > 0) {
          // Fetch question details
          const { data: questoesData, error: questoesError } = await supabase
            .from(tableName)
            .select('*')
            .in('id', questaoIds);
            
          if (questoesError) throw questoesError;
          
          // Check if data is available before processing
          if (questoesData && Array.isArray(questoesData)) {
            setQuestoes(questoesData);
            
            // Calculate stats per area
            const areaMap = new Map<string, {acertos: number, total: number}>();
            
            respostasData?.forEach(resposta => {
              // Find the corresponding question with proper type safety
              const questao = questoesData?.find(q => {
                return q && typeof q === 'object' && 'id' in q && q.id === resposta.questao_id;
              });
              
              // Safely check if question has area property
              if (questao && typeof questao === 'object' && 'area' in questao) {
                // Use nullish coalescing to default if area is null/undefined
                const area = questao?.area ?? 'Não categorizada';
                const currentStats = areaMap.get(area) || {acertos: 0, total: 0};
                
                areaMap.set(area, {
                  acertos: currentStats.acertos + (resposta.acertou ? 1 : 0),
                  total: currentStats.total + 1
                });
              }
            });
            
            // Convert map to array for chart data
            const areaStatsArray = Array.from(areaMap.entries()).map(([area, stats]) => ({
              area,
              acertos: stats.acertos,
              total: stats.total
            }));
            
            setAreaStats(areaStatsArray);
          } else {
            setQuestoes([]);
            setAreaStats([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os resultados do simulado",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResultados();
  }, [sessaoId, navigate, toast, user]);

  const formatTime = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const calcularPercentual = (valor: number, total: number) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const pieChartData = [
    { name: 'Acertos', value: sessao?.acertos || 0 },
    { name: 'Erros', value: (sessao?.total_questoes || 0) - (sessao?.acertos || 0) }
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-72 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Resultado não encontrado</h2>
        <p className="text-muted-foreground mb-6">Não foi possível encontrar os dados deste simulado.</p>
        <Button onClick={() => navigate("/simulados")}>Voltar para Simulados</Button>
      </div>
    );
  }

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resultado do Simulado</h1>
            <p className="text-muted-foreground">
              {sessao?.categoria} • {sessao?.data_inicio && new Date(sessao.data_inicio).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              <span>Salvar PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </Button>
            <Button onClick={() => navigate(`/simulados/${sessao?.categoria?.toLowerCase()}`)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              <span>Novo Simulado</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Desempenho Geral
              </CardTitle>
              <CardDescription>
                Resumo do seu resultado neste simulado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <div className="flex-1">
                  <div className="flex flex-col items-center justify-center p-4 h-full">
                    <div className="h-40 w-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Acertos', value: sessao?.acertos || 0 },
                              { name: 'Erros', value: (sessao?.total_questoes || 0) - (sessao?.acertos || 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Acertos', value: sessao?.acertos || 0 },
                              { name: 'Erros', value: (sessao?.total_questoes || 0) - (sessao?.acertos || 0) }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#22c55e', '#ef4444'][index % 2]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {sessao?.acertos}/{sessao?.total_questoes}
                    </p>
                    <p className="text-sm text-muted-foreground">questões corretas</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Percentual de Acerto</span>
                      <span className="text-sm font-semibold">{sessao?.pontuacao?.toFixed(1)}%</span>
                    </div>
                    <Progress value={sessao?.pontuacao} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 text-2xl font-bold">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(sessao?.tempo_total)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Tempo total</p>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">
                        {formatTime(Math.round((sessao?.tempo_total || 0) / (sessao?.total_questoes || 1)))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Média por questão</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Desempenho por Área</h3>
                {areaStats.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={areaStats}
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'percentual') return [`${value}%`, 'Percentual'];
                            return [value, name];
                          }}
                        />
                        <Bar 
                          name="Percentual de Acerto" 
                          dataKey={(data) => calcularPercentual(data.acertos, data.total)}
                          fill="#3b82f6" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Nenhum dado de área disponível para este simulado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recomendações
              </CardTitle>
              <CardDescription>
                Sugestões para melhorar seu desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {areaStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Áreas para focar:</h3>
                    <ul className="space-y-2">
                      {areaStats
                        .sort((a, b) => calcularPercentual(a.acertos, a.total) - calcularPercentual(b.acertos, b.total))
                        .slice(0, 3)
                        .map((area, index) => (
                          <li key={index} className="flex items-center justify-between border-b pb-1">
                            <span>{area.area}</span>
                            <span className="text-sm font-medium">
                              {calcularPercentual(area.acertos, area.total)}%
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Materiais recomendados:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>Livro: Manual Completo de Direito Civil</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <Video className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>Vídeo-aula: Princípios Constitucionais</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Complete mais simulados para obter recomendações personalizadas.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/biblioteca")}>
                Ver todos os materiais
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Revisão das Questões</CardTitle>
            <CardDescription>
              Reveja as questões e suas respostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">Todas ({respostas.length})</TabsTrigger>
                <TabsTrigger value="corretas">
                  <Check className="h-4 w-4 mr-1" />
                  Corretas ({respostas.filter(r => r.acertou).length})
                </TabsTrigger>
                <TabsTrigger value="erradas">
                  <X className="h-4 w-4 mr-1" />
                  Incorretas ({respostas.filter(r => !r.acertou).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {respostas.map((resposta, index) => {
                    const questao = questoes.find(q => q && typeof q === 'object' && 'id' in q && q.id === resposta.questao_id);
                    if (!questao) return null;
                    
                    return (
                      <Card key={resposta.id} className={`border-l-4 ${resposta.acertou ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Questão {index + 1} • {questao.area || 'Área não especificada'}
                            </span>
                            {resposta.acertou ? (
                              <div className="flex items-center gap-1 text-green-500 text-sm">
                                <Check className="h-4 w-4" /> Correta
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-500 text-sm">
                                <X className="h-4 w-4" /> Incorreta
                              </div>
                            )}
                          </div>
                          
                          <p className="font-medium">{questao.questao}</p>
                          
                          <div className="space-y-1 mt-3">
                            {['A', 'B', 'C', 'D'].map(option => (
                              <div key={option} className={`
                                p-3 rounded-md text-sm
                                ${resposta.resposta_selecionada === option && 
                                  (resposta.acertou ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}
                                ${questao.alternativa_correta === option && !resposta.acertou ? 'bg-green-500/10 border border-green-500/30' : ''}
                                ${resposta.resposta_selecionada !== option && questao.alternativa_correta !== option ? 'bg-card/50 border' : ''}
                              `}>
                                <div className="flex gap-2">
                                  <span className="font-semibold">{option})</span>
                                  <span>{questao[`alternativa_${option.toLowerCase()}`]}</span>
                                </div>
                                {resposta.resposta_selecionada === option && (
                                  <div className="mt-1 flex items-center gap-1 text-xs">
                                    <span className={resposta.acertou ? 'text-green-500' : 'text-red-500'}>
                                      Sua resposta
                                    </span>
                                  </div>
                                )}
                                {questao.alternativa_correta === option && !resposta.acertou && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                                    <span>Resposta correta</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {questao.explicacao && (
                            <div className="bg-muted/50 p-3 rounded-md mt-2 text-sm">
                              <p className="font-medium mb-1">Explicação:</p>
                              <p>{questao.explicacao}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="corretas">
                <div className="space-y-4">
                  {/* Similar to above but filtered for correct answers */}
                  {respostas.filter(r => r.acertou).map((resposta, index) => {
                    const questao = questoes.find(q => q.id === resposta.questao_id);
                    if (!questao) return null;
                    
                    return (
                      <Card key={resposta.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4 space-y-2">
                          {/* Similar content as above */}
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Questão {index + 1} • {questao.area || 'Área não especificada'}
                            </span>
                            <div className="flex items-center gap-1 text-green-500 text-sm">
                              <Check className="h-4 w-4" /> Correta
                            </div>
                          </div>
                          
                          <p className="font-medium">{questao.questao}</p>
                          
                          <div className="space-y-1 mt-3">
                            {['A', 'B', 'C', 'D'].map(option => (
                              <div key={option} className={`
                                p-3 rounded-md text-sm
                                ${resposta.resposta_selecionada === option ? 'bg-green-500/10 border border-green-500/30' : 'bg-card/50 border'}
                              `}>
                                <div className="flex gap-2">
                                  <span className="font-semibold">{option})</span>
                                  <span>{questao[`alternativa_${option.toLowerCase()}`]}</span>
                                </div>
                                {resposta.resposta_selecionada === option && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                                    <span>Sua resposta (correta)</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {questao.explicacao && (
                            <div className="bg-muted/50 p-3 rounded-md mt-2 text-sm">
                              <p className="font-medium mb-1">Explicação:</p>
                              <p>{questao.explicacao}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="erradas">
                <div className="space-y-4">
                  {/* Similar to above but filtered for incorrect answers */}
                  {respostas.filter(r => !r.acertou).map((resposta, index) => {
                    const questao = questoes.find(q => q.id === resposta.questao_id);
                    if (!questao) return null;
                    
                    return (
                      <Card key={resposta.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4 space-y-2">
                          {/* Similar content as above */}
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Questão {index + 1} • {questao.area || 'Área não especificada'}
                            </span>
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                              <X className="h-4 w-4" /> Incorreta
                            </div>
                          </div>
                          
                          <p className="font-medium">{questao.questao}</p>
                          
                          <div className="space-y-1 mt-3">
                            {['A', 'B', 'C', 'D'].map(option => (
                              <div key={option} className={`
                                p-3 rounded-md text-sm
                                ${resposta.resposta_selecionada === option ? 'bg-red-500/10 border border-red-500/30' : ''}
                                ${questao.alternativa_correta === option ? 'bg-green-500/10 border border-green-500/30' : ''}
                                ${resposta.resposta_selecionada !== option && questao.alternativa_correta !== option ? 'bg-card/50 border' : ''}
                              `}>
                                <div className="flex gap-2">
                                  <span className="font-semibold">{option})</span>
                                  <span>{questao[`alternativa_${option.toLowerCase()}`]}</span>
                                </div>
                                {resposta.resposta_selecionada === option && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <span>Sua resposta (incorreta)</span>
                                  </div>
                                )}
                                {questao.alternativa_correta === option && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                                    <span>Resposta correta</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {questao.explicacao && (
                            <div className="bg-muted/50 p-3 rounded-md mt-2 text-sm">
                              <p className="font-medium mb-1">Explicação:</p>
                              <p>{questao.explicacao}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </JuridicalBackground>
  );
};

export default SimuladoResultado;
