
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { GraduationCap, BadgeCheck, Book, TrendingUp, Clock, Award, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";
import { SimuladoCategoria } from "@/types/simulados";
import { Badge } from "@/components/ui/badge";

const categorias: Array<{
  id: SimuladoCategoria;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  color: string;
  questoes: number;
}> = [
  {
    id: "OAB",
    titulo: "Exame da OAB",
    descricao: "Questões de todas as edições do Exame da Ordem",
    icon: GraduationCap,
    color: "bg-blue-500/80 hover:bg-blue-500",
    questoes: 200
  },
  {
    id: "PRF",
    titulo: "Polícia Rodoviária Federal",
    descricao: "Preparação para concursos da PRF",
    icon: BadgeCheck,
    color: "bg-green-500/80 hover:bg-green-500",
    questoes: 150
  },
  {
    id: "PF",
    titulo: "Polícia Federal",
    descricao: "Questões para concursos da Polícia Federal",
    icon: BadgeCheck,
    color: "bg-purple-500/80 hover:bg-purple-500",
    questoes: 120
  },
  {
    id: "TJSP",
    titulo: "Tribunal de Justiça de SP",
    descricao: "Concursos para o TJSP",
    icon: Award,
    color: "bg-amber-500/80 hover:bg-amber-500",
    questoes: 180
  },
  {
    id: "JUIZ",
    titulo: "Magistratura",
    descricao: "Provas para a carreira de Juiz",
    icon: Book,
    color: "bg-red-500/80 hover:bg-red-500",
    questoes: 160
  },
  {
    id: "PROMOTOR",
    titulo: "Ministério Público",
    descricao: "Provas para Promotor de Justiça",
    icon: Award,
    color: "bg-indigo-500/80 hover:bg-indigo-500",
    questoes: 140
  },
  {
    id: "DELEGADO",
    titulo: "Delegado de Polícia",
    descricao: "Concursos para Delegado",
    icon: BadgeCheck,
    color: "bg-teal-500/80 hover:bg-teal-500",
    questoes: 130
  }
];

const Simulados = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simulados</h1>
            <p className="text-muted-foreground">
              Pratique com questões de diversos concursos e exames jurídicos
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/simulados/historico")}>
              <Clock className="mr-2 h-4 w-4" />
              Histórico
            </Button>
            <Button variant="outline" onClick={() => navigate("/simulados/estatisticas")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Estatísticas
            </Button>
            <Button variant="outline" onClick={() => navigate("/simulados/calendario")}>
              <CalendarRange className="mr-2 h-4 w-4" />
              Calendário
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria, index) => (
            <motion.div 
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="h-full cursor-pointer transition-all border hover:shadow-md">
                <CardHeader className={`text-white ${categoria.color} rounded-t-lg`}>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <categoria.icon className="h-5 w-5" />
                      {categoria.titulo}
                    </CardTitle>
                    <Badge variant="outline" className="bg-white/20 border-white/40">
                      {categoria.questoes} questões
                    </Badge>
                  </div>
                  <CardDescription className="text-white/90">
                    {categoria.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-muted-foreground">Recursos disponíveis:</span>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        Simulados personalizados
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        Estatísticas detalhadas
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        Material de estudo específico
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/simulados/${categoria.id.toLowerCase()}`)}
                  >
                    Acessar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Seu Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Simulados realizados</p>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Média de acertos</p>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Melhor categoria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </JuridicalBackground>
  );
};

export default Simulados;
