
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, Plus, CheckCircle, Circle, BarChart, Book, GraduationCap, Edit, Trash } from "lucide-react";

const Cronograma = () => {
  const [viewMode, setViewMode] = useState("hoje");
  
  // Dados de exemplo para tarefas
  const tarefas = [
    {
      id: 1,
      title: "Estudar Direito Constitucional",
      description: "Princípios fundamentais e direitos individuais",
      status: "pendente", // pendente, concluida, atrasada
      date: "20/04/2025",
      time: "09:00 - 11:00",
      priority: "alta", // alta, media, baixa
      category: "Concurso",
      progress: 0
    },
    {
      id: 2,
      title: "Revisar casos de clientes",
      description: "Preparação para audiências da próxima semana",
      status: "pendente",
      date: "20/04/2025",
      time: "14:00 - 16:00",
      priority: "alta",
      category: "Trabalho",
      progress: 0
    },
    {
      id: 3,
      title: "Resumo de Direito Administrativo",
      description: "Finalizar resumo sobre atos administrativos",
      status: "em_progresso",
      date: "20/04/2025",
      time: "16:30 - 18:30",
      priority: "media",
      category: "Concurso",
      progress: 65
    },
    {
      id: 4,
      title: "Revisão de contratos",
      description: "Revisar minutas de contratos de prestação de serviços",
      status: "concluida",
      date: "19/04/2025",
      time: "10:00 - 12:00",
      priority: "media",
      category: "Trabalho",
      progress: 100
    },
    {
      id: 5,
      title: "Simulado OAB",
      description: "Resolver questões da prova anterior",
      status: "atrasada",
      date: "18/04/2025",
      time: "09:00 - 12:00",
      priority: "alta",
      category: "OAB",
      progress: 30
    }
  ];
  
  // Dados de exemplo para metas
  const metas = [
    {
      id: 1,
      title: "Aprovação na OAB",
      deadline: "Julho/2025",
      progress: 65,
      status: "em_progresso",
      tasks: 24,
      completedTasks: 14
    },
    {
      id: 2,
      title: "Concurso Defensoria Pública",
      deadline: "Dezembro/2025",
      progress: 42,
      status: "em_progresso",
      tasks: 36,
      completedTasks: 15
    }
  ];
  
  // Filtragem de tarefas com base na visualização selecionada
  const getTarefasFiltradas = () => {
    const hoje = "20/04/2025"; // Simulando a data atual
    
    switch (viewMode) {
      case "hoje":
        return tarefas.filter(tarefa => tarefa.date === hoje);
      case "semana":
        return tarefas;
      case "concluidas":
        return tarefas.filter(tarefa => tarefa.status === "concluida");
      case "atrasadas":
        return tarefas.filter(tarefa => tarefa.status === "atrasada");
      default:
        return tarefas;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "text-blue-500";
      case "em_progresso":
        return "text-amber-500";
      case "concluida":
        return "text-green-500";
      case "atrasada":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Pendente</Badge>;
      case "em_progresso":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Em progresso</Badge>;
      case "concluida":
        return <Badge className="bg-green-500">Concluída</Badge>;
      case "atrasada":
        return <Badge variant="destructive">Atrasada</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return <Badge className="bg-red-500">Alta</Badge>;
      case "media":
        return <Badge className="bg-amber-500">Média</Badge>;
      case "baix
        return <Badge className="bg-green-500">Baixa</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const tarefasFiltradas = getTarefasFiltradas();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Cronograma de Estudos</h1>
          <p className="text-muted-foreground text-center">
            Organize sua rotina de estudos jurídicos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-md">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Tarefas Pendentes</h3>
                  <p className="text-sm text-muted-foreground">Para hoje</p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {tarefas.filter(t => t.date === "20/04/2025" && t.status !== "concluida").length}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-950 p-2 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium">Tarefas Concluídas</h3>
                  <p className="text-sm text-muted-foreground">Esta semana</p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {tarefas.filter(t => t.status === "concluida").length}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 dark:bg-red-950 p-2 rounded-md">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium">Tarefas Atrasadas</h3>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {tarefas.filter(t => t.status === "atrasada").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Cronograma</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              <CardDescription>Gerencie suas tarefas e compromissos</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="hoje" value={viewMode} onValueChange={setViewMode}>
                <div className="px-6 pb-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="hoje" className="flex-1">Hoje</TabsTrigger>
                    <TabsTrigger value="semana" className="flex-1">Semana</TabsTrigger>
                    <TabsTrigger value="concluidas" className="flex-1">Concluídas</TabsTrigger>
                    <TabsTrigger value="atrasadas" className="flex-1">Atrasadas</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value={viewMode} className="m-0">
                  <div className="px-6 py-2 border-b flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <div className="w-1/2">Tarefa</div>
                    <div className="w-1/6 text-center">Status</div>
                    <div className="w-1/6 text-center">Prioridade</div>
                    <div className="w-1/6 text-center">Ações</div>
                  </div>
                  
                  {tarefasFiltradas.length > 0 ? (
                    <div className="divide-y">
                      {tarefasFiltradas.map(tarefa => (
                        <div key={tarefa.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="w-1/2">
                            <div className="flex items-start gap-3">
                              {tarefa.status === "concluida" ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                              ) : (
                                <Circle className={`h-5 w-5 ${getStatusColor(tarefa.status)} mt-1`} />
                              )}
                              <div>
                                <h4 className={`font-medium mb-1 ${tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>
                                  {tarefa.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">{tarefa.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {tarefa.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {tarefa.date} • {tarefa.time}
                                  </span>
                                </div>
                                {tarefa.status === "em_progresso" && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progresso</span>
                                      <span>{tarefa.progress}%</span>
                                    </div>
                                    <Progress value={tarefa.progress} className="h-1" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-1/6 text-center">
                            {getStatusBadge(tarefa.status)}
                          </div>
                          <div className="w-1/6 text-center">
                            {getPriorityBadge(tarefa.priority)}
                          </div>
                          <div className="w-1/6 flex justify-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                      <p className="text-muted-foreground mb-6">
                        Não há tarefas para exibir nesta visualização.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Nova Tarefa
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendário Completo
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Metas de Estudo</CardTitle>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Acompanhe seu progresso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {metas.map(meta => (
                <div key={meta.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{meta.title}</h4>
                    <Badge variant="outline">
                      {meta.completedTasks}/{meta.tasks} tarefas
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prazo: {meta.deadline}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>Progresso</span>
                    <span>{meta.progress}%</span>
                  </div>
                  <Progress value={meta.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <BarChart className="h-4 w-4 mr-2" />
                Ver Relatório Detalhado
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Materiais de Estudo</CardTitle>
              <CardDescription>Pendentes de revisão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                <Book className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Direito Constitucional</h4>
                  <p className="text-xs text-muted-foreground">Controle de Constitucionalidade</p>
                </div>
                <Badge>Urgente</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                <GraduationCap className="h-6 w-6 text-purple-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Direito Administrativo</h4>
                  <p className="text-xs text-muted-foreground">Improbidade Administrativa</p>
                </div>
                <Badge variant="outline">Em 2 dias</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                <Book className="h-6 w-6 text-green-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Direito Civil</h4>
                  <p className="text-xs text-muted-foreground">Contratos - Parte Geral</p>
                </div>
                <Badge variant="outline">Em 5 dias</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver Todos os Materiais
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cronograma;
