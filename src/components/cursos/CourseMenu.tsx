
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Users, Award, Clock, ArrowLeft } from 'lucide-react';

export interface CourseMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStartCourse?: () => void;
  onBack?: () => void; // Adding back button functionality
  title: string;
  description: string;
  alunos?: number;
  duracao?: string; 
  certificado?: boolean;
  showBackButton?: boolean;
}

export function CourseMenu({ 
  open, 
  onOpenChange, 
  onStartCourse, 
  onBack,
  title = 'Título do Curso', 
  description = 'Descrição do curso',
  alunos = 1200,
  duracao = '10 horas',
  certificado = true,
  showBackButton = false
}: CourseMenuProps) {
  return (
    <Card className="h-full flex flex-col shadow-md">
      <CardHeader className="pb-2">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="self-start mb-2" 
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{duracao} de conteúdo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{alunos} alunos</span>
          </div>
          {certificado && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Award className="h-3.5 w-3.5" />
              <span>Certificado incluso</span>
            </div>
          )}
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
