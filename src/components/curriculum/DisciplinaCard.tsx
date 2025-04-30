
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Star, 
  StarOff, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Check, 
  Clock, 
  MapPin,
  Brain
} from 'lucide-react';
import { getAreaColor } from '@/lib/curriculum-utils';
import type { Disciplina, UserProgressoDisciplina } from '@/types/curriculum';
import { useCurriculum } from '@/hooks/use-curriculum';
import { DisciplinaDialog } from './DisciplinaDialog';

interface DisciplinaCardProps {
  disciplina: Disciplina;
  userProgress?: UserProgressoDisciplina;
}

export function DisciplinaCard({ disciplina, userProgress }: DisciplinaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toggleFavorite, updateStudyStatus } = useCurriculum();

  const getStatusIcon = () => {
    if (!userProgress) return null;
    
    switch (userProgress.status) {
      case 'concluido':
        return <Check className="h-4 w-4 mr-1" />;
      case 'em_progresso':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!userProgress) return "Não iniciado";
    
    switch (userProgress.status) {
      case 'concluido':
        return "Concluído";
      case 'em_progresso':
        return "Em progresso";
      default:
        return "Não iniciado";
    }
  };

  const getStatusColor = () => {
    if (!userProgress) return "secondary";
    
    switch (userProgress.status) {
      case 'concluido':
        return "success";
      case 'em_progresso':
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={`${getAreaColor(disciplina.area)} mb-2`}>
              {disciplina.area}
            </Badge>
            {userProgress && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(disciplina.id);
                }}
                className="h-7 w-7"
              >
                {userProgress.favorito ? (
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{disciplina.nome}</CardTitle>
          <CardDescription className="line-clamp-2">
            {disciplina.descricao || "Sem descrição disponível"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Badge variant={getStatusColor() as any} className="flex items-center">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>
            
            <Badge variant="outline" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {disciplina.periodo}º Período
            </Badge>
          </div>
        </CardContent>
        
        {isExpanded && (
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              <p className="mb-2">{disciplina.descricao || "Sem descrição disponível"}</p>
              {disciplina.ementa && (
                <div className="mt-2">
                  <h4 className="font-medium text-foreground mb-1">Ementa:</h4>
                  <p>{disciplina.ementa}</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
        
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Mais</span>
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Brain className="h-4 w-4" />
              <span>Estudar</span>
            </Button>
            
            {userProgress && (
              <Button 
                variant={userProgress.status === 'concluido' ? 'default' : 'outline'} 
                size="sm" 
                className="gap-1"
                onClick={() => updateStudyStatus(disciplina.id, 
                  userProgress.status === 'concluido' ? 'em_progresso' : 'concluido'
                )}
              >
                <Check className="h-4 w-4" />
                <span>{userProgress.status === 'concluido' ? 'Concluída' : 'Concluir'}</span>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <DisciplinaDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disciplina={disciplina}
        userProgress={userProgress}
      />
    </>
  );
}
