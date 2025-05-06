
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Curso } from '@/types/curso';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Curso;
  index: number;
}

export const CourseCard = ({ course, index }: CourseCardProps) => {
  const navigate = useNavigate();
  
  // Handle local storage progress
  const progress = React.useMemo(() => {
    const savedProgress = localStorage.getItem(`curso_${course.id}_progress`);
    return savedProgress ? parseInt(savedProgress) : 0;
  }, [course.id]);
  
  // Define difficulty color
  const difficultyColor = React.useMemo(() => {
    if (!course.dificuldade) return 'bg-gray-100 text-gray-800';
    
    switch(course.dificuldade.toLowerCase()) {
      case 'básico':
      case 'basico':
      case 'iniciante':
        return 'bg-green-100 text-green-800';
      case 'intermediário':
      case 'intermediario': 
        return 'bg-blue-100 text-blue-800';
      case 'avançado':
      case 'avancado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [course.dificuldade]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border hover:shadow-md transition-all">
        <div 
          className="relative h-36 bg-cover bg-center bg-gray-100"
          style={{ 
            backgroundImage: course.capa ? `url(${course.capa})` : undefined
          }}
        >
          {!course.capa && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/30 to-gray-900/60">
              <BookOpen className="w-10 h-10 text-white/50" />
            </div>
          )}
          
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
        
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium line-clamp-2 text-base">
              {course.materia || course.titulo || 'Curso sem título'}
            </h3>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 py-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.sobre || "Conteúdo exclusivo para sua formação jurídica."}
          </p>
        </CardContent>
        
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {course.dificuldade && (
              <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                {course.dificuldade}
              </Badge>
            )}
            {course.tipo_acesso && (
              <Badge variant="outline" className="font-normal">
                {course.tipo_acesso}
              </Badge>
            )}
          </div>
        </div>
        
        <CardFooter className="p-4 pt-2 border-t bg-muted/20">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => navigate(`/curso/${course.id}`)}
          >
            {progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
