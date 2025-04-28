
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaSelector } from "@/components/videoaulas/AreaSelector";
import { BookOpen, FilePlus, Check, Clock, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

// Áreas jurídicas para exercícios
const AREAS_JURIDICAS = [
  "Petição Inicial",
  "Contestação",
  "Recursos",
  "Habeas Corpus",
  "Mandado de Segurança",
  "Parecer Jurídico"
];

// Níveis de dificuldade
const NIVEIS_DIFICULDADE = ["Iniciante", "Intermediário", "Avançado"];

export const ExerciciosPraticos = () => {
  const [areaSelecionada, setAreaSelecionada] = useState(AREAS_JURIDICAS[0]);
  const [nivelDificuldade, setNivelDificuldade] = useState("Intermediário");
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [submissoes, setSubmissoes] = useState<any[]>([]);
  const [exercicioAtual, setExercicioAtual] = useState<any>(null);
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercicios = async () => {
      setLoading(true);
      try {
        // Em uma implementação real, buscaria do banco de dados
        // Simulação com timeout
        setTimeout(() => {
          // Exercícios de exemplo
          const exerciciosExemplo = [
            {
              id: "ex1",
              titulo: "Petição Inicial - Ação de Cobrança",
              tipo: "Petição Inicial",
              dificuldade: "Intermediário",
              descricao: "Elabore uma petição inicial de ação de cobrança...",
              criterios: ["Estrutura formal", "Linguagem técnica", "Fundamentação"],
              gabarito: "Elementos essenciais: endereçamento, qualificação...",
            },
            {
              id: "ex2",
              titulo: "Contestação - Responsabilidade Civil",
              tipo: "Contestação",
              dificuldade: "Intermediário",
              descricao: "Elabore uma contestação em ação de responsabilidade civil...",
              criterios: ["Preliminares", "Mérito", "Pedidos"],
              gabarito: "Elementos essenciais: tempestividade, preliminares...",
            }
          ];
          
          // Submissões de exemplo
          const submissoesExemplo = [
            {
              id: "sub1",
              exercicio_id: "ex1",
              status: "avaliado",
              pontuacao: 85,
              feedback: "Boa estrutura, mas poderia melhorar a fundamentação..."
            }
          ];
          
          setExercicios(exerciciosExemplo);
          setSubmissoes(submissoesExemplo);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
        setLoading(false);
      }
    };
    
    fetchExercicios();
  }, [areaSelecionada, nivelDificuldade]);

  const handleSubmitExercicio = () => {
    if (!exercicioAtual || !resposta.trim()) return;
    
    // Simular envio da resposta
    const novaSubmissao = {
      id: `sub${Date.now()}`,
      exercicio_id: exercicioAtual.id,
      status: "pendente",
      resposta: resposta,
      data_submissao: new Date().toISOString()
    };
    
    setSubmissoes([...submissoes, novaSubmissao]);
    setResposta("");
    
    // Aqui enviaria para o backend em um cenário real
    alert("Exercício enviado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h3 className="text-xl font-medium">Exercícios Práticos</h3>
          <p className="text-sm text-muted-foreground">
            Pratique suas habilidades de redação jurídica com exercícios reais
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <AreaSelector
            areas={AREAS_JURIDICAS}
            selectedArea={areaSelecionada}
            onAreaSelect={setAreaSelecionada}
            className="w-full sm:w-[180px]"
          />
          <AreaSelector
            areas={NIVEIS_DIFICULDADE}
            selectedArea={nivelDificuldade}
            onAreaSelect={setNivelDificuldade}
            className="w-full sm:w-[180px]"
          />
        </div>
      </div>

      <Tabs defaultValue="disponiveis" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="disponiveis">Exercícios Disponíveis</TabsTrigger>
          <TabsTrigger value="minhasSubmissoes">Minhas Submissões</TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/3 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : exercicios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercicios
                .filter(ex => ex.tipo === areaSelecionada && ex.dificuldade === nivelDificuldade)
                .map((exercicio) => (
                  <Card key={exercicio.id}>
                    <CardHeader>
                      <CardTitle className="text-md">{exercicio.titulo}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {exercicio.tipo}
                        </Badge>
                        <Badge variant="outline">
                          {exercicio.dificuldade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                        {exercicio.descricao}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercicio.criterios.map((criterio: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {criterio}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setExercicioAtual(exercicio)}>
                            <FilePlus className="mr-2 h-4 w-4" />
                            Iniciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          {exercicioAtual && (
                            <>
                              <DialogHeader>
                                <DialogTitle>{exercicioAtual.titulo}</DialogTitle>
                                <DialogDescription>
                                  Leia atentamente as instruções e elabore sua resposta
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 my-4">
                                <div>
                                  <h4 className="font-medium">Instruções</h4>
                                  <p className="text-sm mt-1">{exercicioAtual.descricao}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">Critérios de Avaliação</h4>
                                  <ul className="list-disc list-inside text-sm mt-1">
                                    {exercicioAtual.criterios.map((criterio: string, i: number) => (
                                      <li key={i}>{criterio}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">Sua Resposta</h4>
                                  <Textarea 
                                    className="min-h-[300px] mt-1 font-mono"
                                    placeholder="Digite sua resposta aqui..."
                                    value={resposta}
                                    onChange={(e) => setResposta(e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline">Salvar Rascunho</Button>
                                <Button onClick={handleSubmitExercicio}>Enviar</Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p>Nenhum exercício disponível para os filtros selecionados.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="minhasSubmissoes" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/3 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-4" />
                    <Skeleton className="h-6 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : submissoes.length > 0 ? (
            <div className="space-y-4">
              {submissoes.map((submissao) => {
                const exercicio = exercicios.find(e => e.id === submissao.exercicio_id);
                if (!exercicio) return null;
                
                return (
                  <Card key={submissao.id}>
                    <CardHeader>
                      <CardTitle className="text-md">{exercicio.titulo}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {exercicio.tipo}
                        </Badge>
                        {submissao.status === "avaliado" ? (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="mr-1 h-3 w-3" /> Avaliado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" /> Pendente
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {submissao.status === "avaliado" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Pontuação:</span>
                            <div className="flex items-center">
                              <span className="font-bold text-lg">
                                {submissao.pontuacao}
                              </span>
                              <span className="text-muted-foreground ml-1">/100</span>
                            </div>
                          </div>
                          
                          <Progress value={submissao.pontuacao} className="h-2" />
                          
                          <div className="mt-4">
                            <span className="font-medium">Feedback:</span>
                            <p className="text-sm mt-1 text-muted-foreground">
                              {submissao.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {submissao.status === "pendente" && (
                        <div className="py-2 text-center text-muted-foreground">
                          <p>Sua submissão está em análise.</p>
                          <p className="text-sm">Tempo estimado: 24-48h</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p>Você ainda não submeteu nenhum exercício.</p>
              <Button className="mt-4" variant="outline">
                Explorar Exercícios
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
