
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  CheckCircle, 
  BookOpen, 
  Brain, 
  FileText, 
  Flame, 
  Trophy, 
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PerfilEvolucao = () => {
  // Dados fictícios para demonstração
  const userData = {
    nome: "Estudante de Direito",
    nivel: "Iniciante",
    xp: 450,
    xpNextLevel: 1000,
    diasConsecutivos: 7,
    trilhaProgresso: 35,
    termosAprendidos: 24,
    questoesResolvidas: 47,
    videosAssistidos: 12,
    conquistas: [
      { nome: "Primeiro Passo", descricao: "Iniciou a jornada jurídica", obtida: true },
      { nome: "Vocabulário Iniciante", descricao: "Aprendeu 20+ termos jurídicos", obtida: true },
      { nome: "Constitucionalista", descricao: "Completou estudos básicos de Direito Constitucional", obtida: true },
      { nome: "Dedicação Semanal", descricao: "Estudou 7 dias consecutivos", obtida: true },
      { nome: "Primeiro Simulado", descricao: "Completou seu primeiro simulado", obtida: true },
      { nome: "Civilista", descricao: "Completou estudos básicos de Direito Civil", obtida: false },
      { nome: "Penalista", descricao: "Completou estudos básicos de Direito Penal", obtida: false },
      { nome: "Marathonista", descricao: "Estudou 30 dias consecutivos", obtida: false }
    ],
    desempenhoAreas: [
      { area: "Constitucional", progresso: 60 },
      { area: "Civil", progresso: 45 },
      { area: "Penal", progresso: 30 },
      { area: "Processual", progresso: 15 },
      { area: "Administrativo", progresso: 25 }
    ]
  };

  // Calcular dias restantes do mês para meta
  const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const diaAtual = new Date().getDate();
  const diasRestantes = diasNoMes - diaAtual;

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Seu Perfil de Evolução</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e evolução nos estudos jurídicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nível de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <Badge>{userData.nivel}</Badge>
                <span className="text-xs text-muted-foreground">{userData.xp}/{userData.xpNextLevel} XP</span>
              </div>
              <Progress value={(userData.xp / userData.xpNextLevel) * 100} className="h-2 mb-4" />
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex flex-col items-center justify-center p-3 bg-card rounded-md border border-border">
                  <Flame className="h-6 w-6 text-primary mb-1" />
                  <span className="text-xl font-bold">{userData.diasConsecutivos}</span>
                  <span className="text-xs text-muted-foreground">dias consecutivos</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-card rounded-md border border-border">
                  <Trophy className="h-6 w-6 text-primary mb-1" />
                  <span className="text-xl font-bold">{userData.conquistas.filter(c => c.obtida).length}</span>
                  <span className="text-xs text-muted-foreground">conquistas</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-card rounded-md border border-border">
                  <BookOpen className="h-6 w-6 text-primary mb-1" />
                  <span className="text-xl font-bold">{userData.termosAprendidos}</span>
                  <span className="text-xs text-muted-foreground">termos aprendidos</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-card rounded-md border border-border">
                  <Brain className="h-6 w-6 text-primary mb-1" />
                  <span className="text-xl font-bold">{userData.questoesResolvidas}</span>
                  <span className="text-xs text-muted-foreground">questões resolvidas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Progresso por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.desempenhoAreas.map((area, index) => (
                  <div key={area.area} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div>{area.area}</div>
                      <div className="text-muted-foreground">{area.progresso}%</div>
                    </div>
                    <Progress value={area.progresso} className="h-2" />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-primary/10 p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  Meta do mês
                </h4>
                <p className="text-xs text-muted-foreground">
                  Completar a trilha básica de Direito Civil nos próximos {diasRestantes} dias
                </p>
                <Progress value={userData.trilhaProgresso} className="h-1 mt-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>{userData.trilhaProgresso}% concluído</span>
                  <span>{diasRestantes} dias restantes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {userData.conquistas.map((conquista, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center text-center p-3 rounded-md border ${
                    conquista.obtida ? "bg-primary/10 border-primary/30" : "bg-card border-border opacity-50"
                  }`}
                >
                  <div className={`rounded-full p-2 mb-2 ${
                    conquista.obtida ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      conquista.obtida ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <h4 className="text-sm font-medium">{conquista.nome}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{conquista.descricao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Próximos Passos Recomendados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-primary/20 p-1 rounded">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span>Concluir a trilha básica de Direito Civil</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-primary/20 p-1 rounded">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <span>Realizar seu primeiro simulado de Direito Penal</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-primary/20 p-1 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span>Explorar os materiais introdutórios de Direito Processual</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
