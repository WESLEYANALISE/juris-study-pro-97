
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, BarChart, Trophy, Play, Calendar, Tag } from "lucide-react";

const Simulados = () => {
  const [activeTab, setActiveTab] = useState("disponiveis");
  
  const simuladosDisponiveis = [
    {
      id: 1,
      title: "OAB - 1ª Fase",
      description: "Simulado completo com questões de múltipla escolha",
      category: "OAB",
      totalQuestions: 80,
      duration: 300, // minutos
      difficulty: "Médio",
      tags: ["Constitucional", "Civil", "Penal", "Administrativo"]
    },
    {
      id: 2,
      title: "Magistratura Federal",
      description: "Questões específicas para concurso de juiz federal",
      category: "Magistratura",
      totalQuestions: 100,
      duration: 360,
      difficulty: "Difícil",
      tags: ["Constitucional", "Administrativo", "Processual"]
    },
    {
      id: 3,
      title: "Defensoria Pública",
      description: "Simulado preparatório para defensoria pública estadual",
      category: "Defensoria",
      totalQuestions: 90,
      duration: 330,
      difficulty: "Médio",
      tags: ["Civil", "Penal", "Processual"]
    },
    {
      id: 4,
      title: "Ministério Público",
      description: "Simulado com questões específicas para MP",
      category: "MP",
      totalQuestions: 100,
      duration: 360,
      difficulty: "Difícil",
      tags: ["Constitucional", "Penal", "Direitos Humanos"]
    }
  ];
  
  const simuladosRealizados = [
    {
      id: 101,
      title: "OAB - 1ª Fase (Treino)",
      date: "10/04/2025",
      score: 85,
      totalQuestions: 80,
      rightAnswers: 68,
      duration: 240,
      category: "OAB"
    },
    {
      id: 102,
      title: "Procuradoria Municipal",
      date: "05/04/2025",
      score: 72,
      totalQuestions: 70,
      rightAnswers: 50,
      duration: 180,
      category: "Procuradoria"
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Simulados</h1>
          <p className="text-muted-foreground text-center">
            Pratique com simulados de concursos e exames jurídicos
          </p>
        </div>
      </div>

      <Tabs defaultValue="disponiveis" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
          <TabsTrigger value="realizados">Realizados</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="disponiveis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simuladosDisponiveis.map(simulado => (
              <Card key={simulado.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">{simulado.category}</Badge>
                      <CardTitle>{simulado.title}</CardTitle>
                    </div>
                    <Badge className={
                      simulado.difficulty === "Fácil" ? "bg-green-500" :
                      simulado.difficulty === "Médio" ? "bg-amber-500" :
                      "bg-red-500"
                    }>
                      {simulado.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{simulado.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {simulado.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {simulado.totalQuestions} questões
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(simulado.duration / 60)}h{simulado.duration % 60 > 0 ? `${simulado.duration % 60}min` : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Simulado
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="realizados">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simuladosRealizados.map(simulado => (
              <Card key={simulado.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">{simulado.category}</Badge>
                      <CardTitle>{simulado.title}</CardTitle>
                    </div>
                    <Badge className={
                      simulado.score >= 80 ? "bg-green-500" :
                      simulado.score >= 60 ? "bg-amber-500" :
                      "bg-red-500"
                    }>
                      {simulado.score}%
                    </Badge>
                  </div>
                  <CardDescription>Realizado em {simulado.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Aproveitamento</span>
                      <span>{simulado.score}%</span>
                    </div>
                    <Progress value={simulado.score} className="h-2" />
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {simulado.rightAnswers}/{simulado.totalQuestions} questões
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(simulado.duration / 60)}h{simulado.duration % 60 > 0 ? `${simulado.duration % 60}min` : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">
                    <BarChart className="h-4 w-4 mr-2" />
                    Ver Relatório
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="agendados">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum simulado agendado</h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não tem simulados agendados. Agende um simulado para se preparar melhor!
            </p>
            <Button>Agendar Simulado</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="estatisticas">
          <div className="text-center py-12">
            <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Estatísticas de Desempenho</h3>
            <p className="text-muted-foreground mb-6">
              Complete mais simulados para visualizar estatísticas detalhadas de seu desempenho.
            </p>
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Iniciar um Simulado
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulados;
