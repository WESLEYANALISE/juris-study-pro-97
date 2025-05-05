
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Award, FileCheck, AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SimuladosIniciantesProps {
  stats?: {
    questoesRespondidas?: number;
    questoesCorretas?: number;
  } | null;
}

export const SimuladosIniciantes = ({ stats }: SimuladosIniciantesProps) => {
  const simulados = [
    {
      id: "sim-inicial-intro",
      titulo: "Conceitos Básicos do Direito",
      descricao: "10 questões sobre fundamentos gerais e terminologia jurídica",
      tempo: "15 minutos",
      nivel: "Iniciante",
      badges: ["Fundamentos", "Conceitos"],
      questoes: 10,
      acertos: 0
    },
    {
      id: "sim-inicial-const",
      titulo: "Constituição Brasileira",
      descricao: "15 questões sobre princípios fundamentais e organização do Estado",
      tempo: "20 minutos",
      nivel: "Iniciante",
      badges: ["Constitucional", "Princípios"],
      questoes: 15,
      acertos: 0
    },
    {
      id: "sim-inicial-civil",
      titulo: "Direito Civil Introdutório",
      descricao: "12 questões sobre pessoas, bens e negócios jurídicos",
      tempo: "18 minutos",
      nivel: "Intermediário",
      badges: ["Civil", "Parte Geral"],
      questoes: 12,
      acertos: 0
    },
    {
      id: "sim-inicial-penal",
      titulo: "Introdução ao Direito Penal",
      descricao: "10 questões sobre princípios e conceitos básicos do Direito Penal",
      tempo: "15 minutos",
      nivel: "Intermediário",
      badges: ["Penal", "Princípios"],
      questoes: 10,
      acertos: 0
    }
  ];

  // Calculate if user should be allowed to take more advanced simulados
  const canTakeIntermediate = (stats?.questoesRespondidas || 0) >= 20;
  
  // Calculate correct percentage
  const percentCorrect = stats?.questoesRespondidas 
    ? Math.round((stats.questoesCorretas || 0) / stats.questoesRespondidas * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Simulados para Iniciantes</h2>
        <p className="text-muted-foreground">
          Teste seus conhecimentos com simulados adaptados para quem está começando no Direito.
        </p>
      </div>

      {stats && stats.questoesRespondidas > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Seu progresso</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.questoesRespondidas} questões respondidas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Taxa de acerto</h3>
                <p className="text-sm text-muted-foreground">
                  {percentCorrect}% de acertos
                </p>
              </div>
            </div>
            
            <Button asChild>
              <Link to="/simulados">
                Ver todos os simulados
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulados.map((simulado, idx) => {
          const isIntermediate = simulado.nivel === "Intermediário";
          const isDisabled = isIntermediate && !canTakeIntermediate;
          
          return (
            <motion.div
              key={simulado.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={isDisabled ? "opacity-70" : undefined}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={isIntermediate ? "secondary" : "default"} className="mb-2">
                      {simulado.nivel}
                    </Badge>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {simulado.tempo}
                    </div>
                  </div>
                  <CardTitle>{simulado.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    {simulado.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {simulado.badges.map((badge) => (
                      <span 
                        key={badge} 
                        className="text-xs py-1 px-2 bg-primary/10 text-primary rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {simulado.questoes} questões
                  </div>
                  <Button 
                    asChild={!isDisabled} 
                    disabled={isDisabled}
                    variant={isDisabled ? "outline" : "default"}
                  >
                    {!isDisabled ? (
                      <Link to={`/simulados/iniciante/sessao/${simulado.id}`}>
                        Iniciar Simulado
                      </Link>
                    ) : (
                      <span>Iniciar Simulado</span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!canTakeIntermediate && (
        <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Simulados intermediários bloqueados</h4>
              <p className="text-sm text-muted-foreground">
                Complete pelo menos 20 questões nos simulados introdutórios para desbloquear os simulados de nível intermediário.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
