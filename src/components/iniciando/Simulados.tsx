
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SimuladosIniciantes = () => {
  const navigate = useNavigate();
  
  const simulados = [
    {
      id: 1,
      titulo: "Noções Básicas de Direito Constitucional",
      questoes: 10,
      tempo: "20 minutos",
      dificuldade: "Muito Fácil",
      area: "Constitucional",
      descricao: "Questões básicas sobre os princípios fundamentais e organização do Estado"
    },
    {
      id: 2,
      titulo: "Introdução ao Direito Civil",
      questoes: 15,
      tempo: "30 minutos",
      dificuldade: "Fácil",
      area: "Civil",
      descricao: "Questões sobre personalidade, bens e fatos jurídicos"
    },
    {
      id: 3,
      titulo: "Conceitos Iniciais de Direito Penal",
      questoes: 10,
      tempo: "20 minutos",
      dificuldade: "Fácil",
      area: "Penal",
      descricao: "Questões sobre princípios e aplicação da lei penal"
    }
  ];

  // Simulados "completados" para demonstração
  const historico = [
    {
      id: 101,
      titulo: "Teste de Conceitos Jurídicos Básicos",
      questoes: 10,
      acertos: 7,
      data: "12/04/2025",
      area: "Geral"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Simulados para Iniciantes</h2>
        <p className="text-muted-foreground">
          Questões com dificuldade adequada para quem está começando, com explicações detalhadas.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Simulados Disponíveis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulados.map((simulado, idx) => (
            <motion.div
              key={simulado.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {simulado.area}
                    </Badge>
                    <Badge variant={
                      simulado.dificuldade === "Muito Fácil" ? "secondary" : 
                      simulado.dificuldade === "Fácil" ? "outline" : "default"
                    }>
                      {simulado.dificuldade}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{simulado.titulo}</CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2 flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{simulado.descricao}</p>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{simulado.questoes} questões</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{simulado.tempo}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/simulados")}
                  >
                    Iniciar Simulado
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {historico.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Simulados Realizados
          </h3>
          
          <div className="space-y-4">
            {historico.map((sim) => (
              <Card key={sim.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{sim.titulo}</h4>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span>{sim.data}</span>
                        <Badge variant="outline">{sim.area}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{sim.acertos}/{sim.questoes}</div>
                      <div className="text-xs text-muted-foreground">acertos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Desempenho</span>
                      <span className="font-medium">{Math.round((sim.acertos / sim.questoes) * 100)}%</span>
                    </div>
                    <Progress value={(sim.acertos / sim.questoes) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card p-4 rounded-md border border-border mt-6">
        <h4 className="font-medium mb-2">Recomendação para próximos passos</h4>
        <p className="text-sm text-muted-foreground">
          Após completar os simulados básicos, experimente aprofundar seus conhecimentos nas áreas de melhor desempenho 
          através dos cursos específicos e materiais complementares disponíveis na plataforma.
        </p>
      </div>
    </div>
  );
};
