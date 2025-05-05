
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Users, Award, Clock } from 'lucide-react';

export interface CourseMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStartCourse?: () => void;
  title: string;
  description: string;
}

export function CourseMenu({ 
  open, 
  onOpenChange, 
  onStartCourse, 
  title = 'Título do Curso', 
  description = 'Descrição do curso' 
}: CourseMenuProps) {
  return (
    <Card className="h-full flex flex-col shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>10 horas de conteúdo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>1.2k alunos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5" />
            <span>Certificado incluso</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary" className="w-full" onClick={onStartCourse}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar Curso
        </Button>
      </CardFooter>
    </Card>
  );
}
