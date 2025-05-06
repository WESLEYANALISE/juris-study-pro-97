
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { CourseViewer } from '@/components/cursos/CourseViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Curso } from '@/types/curso';
import { useCursoViewer } from '@/hooks/use-curso-viewer';
import { toast } from 'sonner';

const CursoViewer = () => {
  const { 
    curso, 
    loading, 
    showCourse, 
    menuOpen, 
    setMenuOpen,
    handleStartCourse, 
    handleBack,
    handleNavigateBack,
    updateProgress,
    progress,
    saveNotes,
    notes,
    isBookmarked,
    toggleBookmark,
    videoRef
  } = useCursoViewer();

  // If in course view mode, show the CourseViewer component
  if (showCourse && curso) {
    return (
      <CourseViewer
        title={curso.materia || curso.titulo || ''}
        videoUrl={curso.link || ''}
        onBack={handleBack}
        progress={progress}
        updateProgress={updateProgress}
        downloadUrl={curso.download}
        savedNotes={notes}
        onSaveNotes={saveNotes}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        videoRef={videoRef}
      />
    );
  }

  if (loading) {
    return <div className="container mx-auto py-8">Carregando curso...</div>;
  }

  if (!curso) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Curso não encontrado</h2>
        <p className="text-muted-foreground mb-6">O curso solicitado não está disponível.</p>
        <Button onClick={handleNavigateBack}>Voltar para Cursos</Button>
      </div>
    );
  }

  // Function to map database fields to what the CourseMenu expects
  const mapCursoToCourseMenu = (curso: Curso) => {
    return {
      title: curso.titulo || curso.materia || 'Curso sem título',
      description: curso.descricao || curso.sobre || '',
      alunos: curso.alunos || 0,
      duracao: curso.duracao || '1h',
      certificado: true,
    };
  };

  const courseMenuProps = mapCursoToCourseMenu(curso);

  return (
    <div className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <CourseMenu 
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onStartCourse={handleStartCourse}
          onBack={handleNavigateBack} 
          showBackButton={true}
          {...courseMenuProps}
        />
      </div>

      <div className="md:col-span-3 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{courseMenuProps.title}</CardTitle>
            <CardDescription>{courseMenuProps.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <img src={curso.thumbnail || curso.capa} alt={courseMenuProps.title} className="rounded-md mb-4 w-full h-[240px] object-cover" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Autor:</p>
                <p>{curso.autor || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria:</p>
                <p>{curso.categoria || curso.area || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dificuldade:</p>
                <p>{curso.dificuldade || 'Iniciante'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de acesso:</p>
                <p>{curso.tipo_acesso || 'Gratuito'}</p>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleStartCourse}>
              Iniciar Curso
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Conteúdo do Curso</CardTitle>
            <CardDescription>Explore os módulos e aulas deste curso</CardDescription>
          </CardHeader>
          <CardContent>
            {curso.conteudo ? (
              <Accordion type="single" collapsible>
                {Object.entries(curso.conteudo).map(([modulo, aulas], index) => (
                  <AccordionItem value={`modulo-${index}`} key={index}>
                    <AccordionTrigger>
                      Módulo {index + 1}: {modulo}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[300px] w-full rounded-md border">
                        <div className="p-4">
                          {aulas && Array.isArray(aulas) ? (
                            <ul className="list-none space-y-2">
                              {aulas.map((aula, aulaIndex) => (
                                <li key={aulaIndex} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium">
                                      {aulaIndex + 1}
                                    </div>
                                    <span>{aula.titulo}</span>
                                  </div>
                                  <Badge variant="outline">Gratuito</Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">Nenhuma aula disponível neste módulo.</p>
                          )}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Este curso não possui módulos definidos.</p>
                <Button variant="outline" className="mt-4" onClick={handleStartCourse}>
                  Ir direto para o conteúdo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CursoViewer;
