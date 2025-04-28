
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";
import { CheckCircle2, XCircle, Clock, ArrowRight, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface ResultadoQuestao {
  questao_id: string;
  questao_texto: string;
  resposta_selecionada: string;
  resposta_correta: string;
  acertou: boolean;
  tempo_resposta: number;
  area?: string;
}

interface ResultadoSessao {
  id: string;
  categoria: string;
  data_inicio: string;
  data_fim: string;
  total_questoes: number;
  acertos: number;
  pontuacao: number;
  tempo_total: number;
  completo: boolean;
}

const SimuladoResultado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessao, setSessao] = useState<ResultadoSessao | null>(null);
  const [respostas, setRespostas] = useState<ResultadoQuestao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areaStats, setAreaStats] = useState<{ name: string, acertos: number, erros: number }[]>([]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch session and answers data
  useEffect(() => {
    const fetchResultados = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch session data
        const { data: sessaoData, error: sessaoError } = await supabase
          .from("simulado_sessoes")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
          
        if (sessaoError) throw sessaoError;
        if (!sessaoData) {
          toast({
            title: "Simulado não encontrado",
            description: "Não foi possível encontrar este simulado.",
            variant: "destructive"
          });
          navigate("/simulados");
          return;
        }
        
        setSessao(sessaoData);
        
        // Fetch answers with questions
        const { data: respostasData, error: respostasError } = await supabase
          .from("simulado_respostas")
          .select(`
            id,
            questao_id,
            resposta_selecionada,
            acertou,
            tempo_resposta,
            simulados_${sessaoData.categoria.toLowerCase()}!inner(
              questao,
              alternativa_correta,
              area
            )
          `)
          .eq("sessao_id", id);
          
        if (respostasError) throw respostasError;
        
        // Transform the data
        const formattedRespostas: ResultadoQuestao[] = respostasData.map((item: any) => {
          const questaoData = item[`simulados_${sessaoData.categoria.toLowerCase()}`];
          return {
            questao_id: item.questao_id,
            questao_texto: questaoData.questao,
            resposta_selecionada: item.resposta_selecionada,
            resposta_correta: questaoData.alternativa_correta,
            acertou: item.acertou,
            tempo_resposta: item.tempo_resposta,
            area: questaoData.area
          };
        });
        
        setRespostas(formattedRespostas);
        
        // Calculate stats by area
        const areaMap = new Map<string, { acertos: number, erros: number }>();
        
        formattedRespostas.forEach(resposta => {
          const area = resposta.area || "Geral";
          if (!areaMap.has(area)) {
            areaMap.set(area, { acertos: 0, erros: 0 });
          }
          
          const stat = areaMap.get(area)!;
          if (resposta.acertou) {
            stat.acertos += 1;
          } else {
            stat.erros += 1;
          }
        });
        
        const areaStatsArray = Array.from(areaMap.entries()).map(([name, stats]) => ({
          name,
          acertos: stats.acertos,
          erros: stats.erros
        }));
        
        setAreaStats(areaStatsArray);
      } catch (error) {
        console.error("Erro ao carregar resultados:", error);
        toast({
          title: "Erro ao carregar resultados",
          description: "Ocorreu um erro ao carregar os resultados do simulado.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultados();
  }, [id, user, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Carregando resultados...</p>
      </div>
    );
  }
  
  if (!sessao) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold">Simulado não encontrado</h2>
        <p className="text-muted-foreground mb-6">Não foi possível encontrar este simulado.</p>
        <Button onClick={() => navigate("/simulados")}>Voltar para Simulados</Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const percentAcertos = (sessao.acertos / sessao.total_questoes) * 100;
  const data = [
    { name: "Acertos", value: sessao.acertos, color: "#4ADE80" },
    { name: "Erros", value: sessao.total_questoes - sessao.acertos, color: "#F87171" }
  ];
  
  const tempoMedio = Math.round(sessao.tempo_total / sessao.total_questoes);
  
  const getPerformanceMessage = () => {
    if (percentAcertos >= 90) return "Excelente! Você está dominando o conteúdo.";
    if (percentAcertos >= 75) return "Muito bom! Continue assim.";
    if (percentAcertos >= 60) return "Bom trabalho! Mas ainda há espaço para melhorar.";
    if (percentAcertos >= 40) return "Você está no caminho certo, mas precisa estudar mais.";
    return "Dedique mais tempo ao estudo deste conteúdo.";
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Resultado do Simulado</h1>
        <p className="text-muted-foreground">
          Categoria: {sessao.categoria} • Concluído em: {new Date(sessao.data_fim).toLocaleDateString()}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Pontuação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{Math.round(sessao.pontuacao)}</div>
              <Progress value={sessao.pontuacao} className="h-2 mt-2" />
              <p className="text-sm text-muted-foreground mt-2">{getPerformanceMessage()}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Acertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{sessao.acertos}/{sessao.total_questoes}</div>
              <Progress value={percentAcertos} className="h-2 mt-2" />
              <p className="text-sm text-muted-foreground mt-2">{percentAcertos.toFixed(1)}% de acertos</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{formatTime(sessao.tempo_total)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Média por questão: {formatTime(tempoMedio)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="w-full justify-start mb-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="charts">Estatísticas</TabsTrigger>
          <TabsTrigger value="answers">Respostas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desempenho por Área</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={areaStats}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="acertos" fill="#4ADE80" name="Acertos" />
                    <Bar dataKey="erros" fill="#F87171" name="Erros" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição de Acertos</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="answers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suas respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {respostas.map((resposta, index) => (
                  <motion.div
                    key={resposta.questao_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">Questão {index + 1}</div>
                        {resposta.area && (
                          <div className="text-sm text-muted-foreground">Área: {resposta.area}</div>
                        )}
                      </div>
                      <div className="flex items-center">
                        {resposta.acertou ? (
                          <div className="flex items-center text-success">
                            <CheckCircle2 className="h-5 w-5 mr-1" />
                            <span>Correto</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-destructive">
                            <XCircle className="h-5 w-5 mr-1" />
                            <span>Incorreto</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4">{resposta.questao_texto}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Sua resposta:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          resposta.acertou ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {resposta.resposta_selecionada}
                        </span>
                      </div>
                      
                      {!resposta.acertou && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Resposta correta:</span>
                          <span className="ml-2 px-2 py-1 rounded bg-success/20 text-success text-sm">
                            {resposta.resposta_correta}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Tempo: {formatTime(resposta.tempo_resposta)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/simulados")}
        >
          Voltar para Simulados
        </Button>
        
        <Button
          onClick={() => navigate("/simulados/novo")}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Iniciar novo simulado
        </Button>
      </div>
    </div>
  );
};

export default SimuladoResultado;
