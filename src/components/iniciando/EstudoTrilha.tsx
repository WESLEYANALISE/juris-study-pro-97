
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, BookOpen, Scale, Gavel, FileText, Library, BrainCircuit, HeartHandshake, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

interface EstudoTrilhaProps {
  userProgress?: any | null;
}

export const EstudoTrilha = ({ userProgress }: EstudoTrilhaProps) => {
  const trilhas = [
    {
      nivel: "Básico",
      cards: [
        {
          titulo: "Introdução ao Direito", 
          descricao: "Conceitos fundamentais, fontes do Direito e normas jurídicas", 
          icon: BookOpen,
          ordem: 1,
          id: "intro-direito",
          linkTo: "/curso/intro-direito"
        },
        {
          titulo: "Direito Constitucional Básico", 
          descricao: "Constituição, princípios fundamentais e organização do Estado", 
          icon: ScrollText,
          ordem: 2,
          id: "constitucional-basico",
          linkTo: "/curso/constitucional-basico"
        },
        {
          titulo: "Direito Civil - Parte Geral", 
          descricao: "Pessoas, bens, fatos e negócios jurídicos", 
          icon: FileText,
          ordem: 3,
          id: "civil-geral",
          linkTo: "/curso/civil-geral"
        }
      ]
    },
    {
      nivel: "Intermediário",
      cards: [
        {
          titulo: "Direito Penal - Parte Geral", 
          descricao: "Princípios, teoria do crime e aplicação da lei penal", 
          icon: Gavel,
          ordem: 4,
          id: "penal-geral",
          linkTo: "/curso/penal-geral"
        },
        {
          titulo: "Direito Processual Civil", 
          descricao: "Procedimentos, petições e atos processuais", 
          icon: Scale,
          ordem: 5,
          id: "proc-civil",
          linkTo: "/curso/proc-civil"
        },
        {
          titulo: "Direito Administrativo", 
          descricao: "Administração pública, atos administrativos e licitações", 
          icon: Library,
          ordem: 6,
          id: "administrativo",
          linkTo: "/curso/administrativo"
        }
      ]
    },
    {
      nivel: "Avançado",
      cards: [
        {
          titulo: "Direito Tributário", 
          descricao: "Sistema tributário, impostos e obrigações fiscais", 
          icon: BrainCircuit,
          ordem: 7,
          id: "tributario",
          linkTo: "/curso/tributario"
        },
        {
          titulo: "Direito do Trabalho", 
          descricao: "Relações de trabalho, direitos trabalhistas e previdência", 
          icon: HeartHandshake,
          ordem: 8,
          id: "trabalho",
          linkTo: "/curso/trabalho"
        }
      ]
    }
  ];

  // Get progress for a specific course
  const getCourseProgress = (courseId: string) => {
    if (!userProgress) return 0;
    
    // Check if there is a progress field for this course
    const progressField = `progresso_${courseId.replace(/-/g, '_')}`;
    return userProgress[progressField] || 0;
  };

  // Check if a course is completed
  const isCourseCompleted = (courseId: string) => {
    return getCourseProgress(courseId) >= 100;
  };

  // Get the next recommended course based on progress
  const getNextRecommendedCourse = () => {
    // Flatten all courses
    const allCourses = trilhas.flatMap(trilha => trilha.cards);
    
    // Find the first course that's not completed or has the lowest progress
    return allCourses.reduce((recommended, current) => {
      const currentProgress = getCourseProgress(current.id);
      const recommendedProgress = recommended ? getCourseProgress(recommended.id) : 101;
      
      return currentProgress < recommendedProgress ? current : recommended;
    }, null);
  };

  const nextCourse = getNextRecommendedCourse();

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Trilha de Estudo Recomendada</h2>
        <p className="text-muted-foreground">
          Um guia estruturado para iniciar seus estudos jurídicos na ordem mais didática.
        </p>
      </div>

      {nextCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20 mb-8"
        >
          <h3 className="text-lg font-semibold mb-2">Próximo na sua jornada</h3>
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <nextCourse.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{nextCourse.titulo}</h4>
              <div className="mt-2 mb-2">
                <Progress value={getCourseProgress(nextCourse.id)} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                {getCourseProgress(nextCourse.id)}% completo
              </div>
            </div>
            <Button asChild>
              <Link to={nextCourse.linkTo}>Continuar</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-10">
        {trilhas.map((trilha, idx) => (
          <motion.div 
            key={trilha.nivel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">{trilha.nivel}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trilha.cards.map((card) => {
                const progress = getCourseProgress(card.id);
                const completed = isCourseCompleted(card.id);
                
                return (
                  <Card 
                    key={card.titulo} 
                    className={`border-2 transition-colors ${completed 
                      ? "border-green-500/50 bg-green-50/10" 
                      : progress > 0 
                        ? "border-primary/50" 
                        : "hover:border-primary/50"}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <card.icon className={`h-8 w-8 ${completed ? "text-green-500" : "text-primary"}`} />
                        <span className={`${completed 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-primary/10 text-primary"} text-xs px-2 py-1 rounded-full`}
                        >
                          {completed ? "Completo" : `Passo ${card.ordem}`}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{card.titulo}</CardTitle>
                      <CardDescription>{card.descricao}</CardDescription>
                      
                      {progress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={completed ? "outline" : "default"} 
                        size="sm" 
                        className="w-full"
                        asChild
                      >
                        <Link to={card.linkTo}>
                          {completed ? "Revisar material" : progress > 0 ? "Continuar" : "Ver materiais"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-md border border-border mt-8">
        <h4 className="font-medium mb-2">Dica para iniciantes</h4>
        <p className="text-sm text-muted-foreground">
          A trilha de estudo foi organizada para oferecer uma progressão coerente. 
          Recomendamos seguir a ordem sugerida para construir uma base sólida de conhecimentos jurídicos.
        </p>
      </div>
    </div>
  );
};
