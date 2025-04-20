
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Settings, Bell, Shield, Book, GraduationCap, BarChart, History, Clock, Trophy } from "lucide-react";

const Perfil = () => {
  const [currentTab, setCurrentTab] = useState("perfil");

  // Dados de exemplo para o perfil do usuário
  const userData = {
    name: "Carlos Oliveira",
    email: "carlos.oliveira@exemplo.com",
    profession: "Advogado",
    specialization: "Direito Civil",
    memberSince: "Janeiro de 2025",
    studyHours: 120,
    completedSimulados: 15,
    flashcardsReviewed: 450,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Dados de exemplo para atividades recentes
  const recentActivities = [
    { id: 1, type: "Simulado", name: "OAB - 1ª Fase", date: "19/04/2025", score: "85%" },
    { id: 2, type: "Flashcard", name: "Direito Penal - Parte Geral", date: "18/04/2025", cards: 50 },
    { id: 3, type: "Vídeo-aula", name: "Direito Constitucional - Controle de Constitucionalidade", date: "17/04/2025", duration: "45min" },
    { id: 4, type: "Resumo", name: "Direito Administrativo - Licitações", date: "16/04/2025", pages: 8 }
  ];

  // Configurações de exemplo
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    study: true,
    news: false
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <User className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Perfil</h1>
          <p className="text-muted-foreground text-center">
            Gerencie suas informações e configurações
          </p>
        </div>
      </div>

      <Tabs defaultValue="perfil" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <img src={userData.avatar} alt={userData.name} />
                </Avatar>
                <h3 className="text-xl font-bold">{userData.name}</h3>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  <Badge>{userData.profession}</Badge>
                  <Badge variant="outline">{userData.specialization}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Membro desde {userData.memberSince}
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Editar Perfil</Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas de Estudo</CardTitle>
                <CardDescription>Resumo da sua atividade na plataforma</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="bg-accent rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="text-2xl font-bold">{userData.studyHours}</h4>
                  <p className="text-sm text-muted-foreground">Horas de estudo</p>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                  <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="text-2xl font-bold">{userData.completedSimulados}</h4>
                  <p className="text-sm text-muted-foreground">Simulados completos</p>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                  <Book className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="text-2xl font-bold">{userData.flashcardsReviewed}</h4>
                  <p className="text-sm text-muted-foreground">Flashcards revisados</p>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="text-2xl font-bold">Nível 3</h4>
                  <p className="text-sm text-muted-foreground">Progresso de gamificação</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver Estatísticas Detalhadas</Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Plano de Estudos</CardTitle>
                <CardDescription>Suas metas de estudo atuais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">OAB 1ª Fase</h4>
                      <p className="text-sm text-muted-foreground">Objetivo: Aprovação em Julho/2025</p>
                    </div>
                    <Badge className="bg-green-500">Em andamento</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso Geral</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="bg-accent p-2 rounded-md">
                      <p className="font-medium">Constitucional</p>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-1">
                        <div className="bg-primary h-full rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                    <div className="bg-accent p-2 rounded-md">
                      <p className="font-medium">Civil</p>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-1">
                        <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div className="bg-accent p-2 rounded-md">
                      <p className="font-medium">Penal</p>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-1">
                        <div className="bg-primary h-full rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div className="bg-accent p-2 rounded-md">
                      <p className="font-medium">Administrativo</p>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-1">
                        <div className="bg-primary h-full rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Gerenciar Plano de Estudos</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="atividades">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Suas interações recentes na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center p-3 bg-accent rounded-lg">
                    <div className="mr-4">
                      {activity.type === "Simulado" && <GraduationCap className="h-8 w-8 text-blue-500" />}
                      {activity.type === "Flashcard" && <Book className="h-8 w-8 text-purple-500" />}
                      {activity.type === "Vídeo-aula" && <User className="h-8 w-8 text-red-500" />}
                      {activity.type === "Resumo" && <Book className="h-8 w-8 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-muted-foreground">{activity.type}</p>
                        </div>
                        <Badge variant="outline">{activity.date}</Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        {activity.score && <span>Pontuação: {activity.score}</span>}
                        {activity.cards && <span>{activity.cards} cartões revisados</span>}
                        {activity.duration && <span>Duração: {activity.duration}</span>}
                        {activity.pages && <span>{activity.pages} páginas</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4 mr-2" />
                Ver Histórico Completo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="estatisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Detalhadas</CardTitle>
              <CardDescription>Análise de seu desempenho na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <BarChart className="h-24 w-24 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Estatísticas em Desenvolvimento</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Estamos aprimorando as estatísticas detalhadas para fornecer análises mais precisas do seu progresso de estudo.
              </p>
              <Button variant="outline">Receber Notificação Quando Disponível</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notificações</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes no seu e-mail
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, email: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="app-notifications">Notificações no Aplicativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações dentro da plataforma
                    </p>
                  </div>
                  <Switch
                    id="app-notifications"
                    checked={notifications.app}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, app: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="study-reminders">Lembretes de Estudo</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes para manter sua rotina de estudos
                    </p>
                  </div>
                  <Switch
                    id="study-reminders"
                    checked={notifications.study}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, study: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="news-updates">Atualizações e Novidades</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba informações sobre novas funcionalidades e eventos
                    </p>
                  </div>
                  <Switch
                    id="news-updates"
                    checked={notifications.news}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, news: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Privacidade e Segurança</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="w-full mt-2">Alterar Senha</Button>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Sessões Ativas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-accent rounded-md">
                      <div>
                        <p className="font-medium">Este dispositivo</p>
                        <p className="text-xs text-muted-foreground">Windows • Chrome • São Paulo, BR</p>
                      </div>
                      <Badge>Ativo agora</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2">Encerrar Todas as Sessões</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Preferências de Estudo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="study-area">Área de Interesse Principal</Label>
                  <select 
                    id="study-area" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="civil">Direito Civil</option>
                    <option value="penal">Direito Penal</option>
                    <option value="constitucional">Direito Constitucional</option>
                    <option value="administrativo">Direito Administrativo</option>
                    <option value="trabalho">Direito do Trabalho</option>
                  </select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="study-goals">Objetivo de Estudo</Label>
                  <select 
                    id="study-goals" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="oab">Exame da OAB</option>
                    <option value="concurso">Concurso Público</option>
                    <option value="magistratura">Magistratura</option>
                    <option value="mp">Ministério Público</option>
                    <option value="defensoria">Defensoria Pública</option>
                    <option value="academico">Estudos Acadêmicos</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-goals">Definir Metas Diárias</Label>
                    <p className="text-sm text-muted-foreground">
                      Estabeleça metas diárias para seu estudo
                    </p>
                  </div>
                  <Switch id="daily-goals" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme-preference">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Preferência de tema para a plataforma
                    </p>
                  </div>
                  <Switch id="theme-preference" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Perfil;
