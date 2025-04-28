
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, CheckCircle, Star, TrendingUp, Award, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const GamificacaoRedacao = () => {
  const [loading, setLoading] = useState(true);
  const [progressoUsuario, setProgressoUsuario] = useState<any>(null);
  const [conquistasUsuario, setConquistasUsuario] = useState<any[]>([]);
  const [desafiosAtivos, setDesafiosAtivos] = useState<any[]>([]);

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      try {
        // Em um cenário real, buscaria do banco de dados
        // Simulação com timeout
        setTimeout(() => {
          const progressoExemplo = {
            nivel: "Intermediário",
            pontos: 180,
            pontosProximoNivel: 250,
            exerciciosConcluidos: 7,
            pecasCriadas: 4,
            diasConsecutivos: 3,
            ranking: 42
          };
          
          const conquistasExemplo = [
            {
              id: "c1",
              nome: "Primeira Petição",
              descricao: "Criou sua primeira petição no gerador de peças",
              icone: "trophy",
              data: "10/03/2025",
              conquistado: true
            },
            {
              id: "c2",
              nome: "Revisor Atento",
              descricao: "Revisou 5 textos usando o revisor",
              icone: "check",
              data: "15/03/2025",
              conquistado: true
            },
            {
              id: "c3",
              nome: "Mestre da Contestação",
              descricao: "Completou 3 exercícios de contestação",
              icone: "star",
              data: null,
              conquistado: false,
              progresso: 66
            },
            {
              id: "c4",
              nome: "Redator Elite",
              descricao: "Atingiu o nível Avançado",
              icone: "award",
              data: null,
              conquistado: false,
              progresso: 20
            }
          ];
          
          const desafiosExemplo = [
            {
              id: "d1",
              titulo: "Desafio Semanal: Habeas Corpus",
              descricao: "Crie uma petição de Habeas Corpus usando o gerador",
              prazo: "Termina em 3 dias",
              recompensa: 50,
              progresso: 0
            },
            {
              id: "d2",
              titulo: "Ajude a comunidade",
              descricao: "Responda 3 dúvidas no fórum da comunidade",
              prazo: "Termina em 5 dias",
              recompensa: 30,
              progresso: 33
            }
          ];
          
          setProgressoUsuario(progressoExemplo);
          setConquistasUsuario(conquistasExemplo);
          setDesafiosAtivos(desafiosExemplo);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dados de gamificação:", error);
        setLoading(false);
      }
    };
    
    fetchDados();
  }, []);

  const renderIcone = (tipo: string) => {
    switch (tipo) {
      case "trophy": 
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case "check": 
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "star": 
        return <Star className="h-5 w-5 text-purple-500" />;
      case "award": 
        return <Award className="h-5 w-5 text-blue-500" />;
      default:
        return <Trophy className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="progresso" className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="progresso">Seu Progresso</TabsTrigger>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          <TabsTrigger value="desafios">Desafios</TabsTrigger>
        </TabsList>

        <TabsContent value="progresso" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : progressoUsuario ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Seu Progresso em Redação Jurídica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Nível atual</span>
                        <div className="font-bold text-lg">{progressoUsuario.nivel}</div>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Ranking: #{progressoUsuario.ranking}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{progressoUsuario.pontos} pontos</span>
                        <span>{progressoUsuario.pontosProximoNivel} pontos</span>
                      </div>
                      <Progress 
                        value={(progressoUsuario.pontos / progressoUsuario.pontosProximoNivel) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-center text-muted-foreground">
                        {progressoUsuario.pontosProximoNivel - progressoUsuario.pontos} pontos para o próximo nível
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="text-3xl font-bold">
                            {progressoUsuario.exerciciosConcluidos}
                          </div>
                          <p className="text-sm text-muted-foreground text-center mt-1">
                            Exercícios Concluídos
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="text-3xl font-bold">
                            {progressoUsuario.pecasCriadas}
                          </div>
                          <p className="text-sm text-muted-foreground text-center mt-1">
                            Peças Criadas
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="text-3xl font-bold">
                            {progressoUsuario.diasConsecutivos}
                          </div>
                          <p className="text-sm text-muted-foreground text-center mt-1">
                            Dias Consecutivos
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">
                  Você ainda não possui dados de progresso.
                </p>
                <p className="text-muted-foreground mb-4">
                  Complete exercícios e crie peças para começar a acompanhar seu desenvolvimento.
                </p>
                <Button>Começar Agora</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conquistas" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : conquistasUsuario && conquistasUsuario.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conquistasUsuario
                  .filter(c => c.conquistado)
                  .map((conquista) => (
                    <Card key={conquista.id} className="border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {renderIcone(conquista.icone)}
                          <div>
                            <h4 className="font-medium">{conquista.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {conquista.descricao}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                Obtido em {conquista.data}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Conquistas Pendentes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conquistasUsuario
                    .filter(c => !c.conquistado)
                    .map((conquista) => (
                      <Card key={conquista.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {renderIcone(conquista.icone)}
                            <div className="flex-1">
                              <h4 className="font-medium">{conquista.nome}</h4>
                              <p className="text-sm text-muted-foreground">
                                {conquista.descricao}
                              </p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progresso</span>
                                  <span>{conquista.progresso}%</span>
                                </div>
                                <Progress value={conquista.progresso} className="h-1" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">
                  Você ainda não tem conquistas.
                </p>
                <p className="text-muted-foreground mb-4">
                  Use as ferramentas de redação para desbloquear conquistas!
                </p>
                <Button>Explorar Ferramentas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="desafios" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-4/5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center justify-between mt-4">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : desafiosAtivos && desafiosAtivos.length > 0 ? (
            <div className="space-y-4">
              {desafiosAtivos.map((desafio) => (
                <Card key={desafio.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <Trophy className="h-5 w-5 text-amber-500 mt-1" />
                      {desafio.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{desafio.descricao}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm text-muted-foreground">{desafio.prazo}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm font-medium">Recompensa: {desafio.recompensa} pontos</span>
                        </div>
                        
                        {desafio.progresso > 0 && (
                          <div className="w-full mt-2">
                            <Progress value={desafio.progresso} className="h-1" />
                          </div>
                        )}
                      </div>
                      
                      <Button>
                        Iniciar Desafio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center mt-6">
                <Button variant="outline">
                  Ver Desafios Anteriores
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">
                  Não há desafios ativos no momento.
                </p>
                <p className="text-muted-foreground mb-4">
                  Novos desafios são lançados semanalmente!
                </p>
                <Button>Ser Notificado</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
