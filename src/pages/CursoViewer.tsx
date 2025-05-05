
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, PlayCircle, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Curso } from '@/types/curso';

const CursoViewer = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: curso, isLoading } = useQuery({
    queryKey: ['curso', cursoId],
    queryFn: async () => {
      try {
        // Parse the cursoId as a number or use a default fallback
        const cursoIdNum = cursoId ? parseInt(cursoId, 10) : 0;
        
        const { data, error } = await supabase
          .from('cursos_narrados')
          .select('*')
          .eq('id', cursoIdNum)
          .single();
        
        if (error) {
          throw error;
        }
        
        return data as Curso;
      } catch (error) {
        console.error('Error fetching course:', error);
        return null;
      }
    },
    enabled: !!cursoId,
  });

  const handleStartCourse = () => {
    console.log('Starting course');
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Carregando curso...</div>;
  }

  if (!curso) {
    return <div className="container mx-auto py-8">Curso não encontrado.</div>;
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
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          onStartCourse={handleStartCourse}
          onBack={() => navigate('/cursos')} 
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
            <img src={curso.thumbnail || curso.capa} alt={courseMenuProps.title} className="rounded-md mb-4 w-full" />
            <p>Autor: {curso.autor || 'Não informado'}</p>
            <p>Categoria: {curso.categoria || curso.area || 'Não informada'}</p>
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
                                <li key={aulaIndex} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-gray-500" />
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
              <div className="text-center py-4 text-muted-foreground">
                <AlertTriangle className="inline-block h-6 w-6 mr-2" />
                Conteúdo do curso não disponível.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CursoViewer;
