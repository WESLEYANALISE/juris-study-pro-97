import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Lightbulb, Search, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Curso } from '@/types/curso';
import { HistoricoQuestao, ProgressoUsuario } from '@/types/supabase';

interface HistoricoQuestao {
  questao_id: string;
  visualizado_em: string;
}

interface ProgressoUsuario {
  progresso: number;
}

const IniciandoNoDireito = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<HistoricoQuestao[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressoUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('cursos_narrados')
          .select('*')
          .limit(3);

        if (coursesError) {
          console.error('Erro ao buscar cursos:', coursesError);
        } else {
          setCourses((coursesData || []) as Curso[]);
        }

        // For user progress
        const fetchUserProgress = async () => {
          if (!user) return null;
          
          try {
            const { data, error } = await supabase
              .from('progresso_usuario')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              console.error('Erro ao buscar progresso:', error);
              return null;
            }
            
            // Return the data as ProgressoUsuario or a default object if null
            return data ? (data as ProgressoUsuario) : null;
          } catch (error) {
            console.error('Erro ao buscar progresso:', error);
            return null;
          }
        };

        // For question history
        const fetchRecentQuestions = async () => {
          if (!user) return [];
          
          try {
            const { data, error } = await supabase
              .from('historico_questoes')
              .select('questao_id, visualizado_em')
              .eq('user_id', user.id)
              .order('visualizado_em', { ascending: false })
              .limit(5);
              
            if (error) {
              console.error('Erro ao buscar questões recentes:', error);
              return [];
            }
            
            // Return the data as HistoricoQuestao[] or an empty array if null
            return (data || []) as HistoricoQuestao[];
          } catch (error) {
            console.error('Erro ao buscar questões recentes:', error);
            return [];
          }
        };

        const progress = await fetchUserProgress();
        setUserProgress(progress);

        const questions = await fetchRecentQuestions();
        setRecentQuestions(questions);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Function to map database fields to what the CourseMenu expects
  const mapCursoToCourseMenu = (curso: Curso) => {
    return {
      title: curso.titulo || curso.materia || 'Curso sem título',
      description: curso.descricao || curso.sobre || '',
      alunos: curso.alunos || 0,
      duracao: curso.duracao || '1h',
    };
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Iniciando no Direito</h1>
        <p className="text-lg text-muted-foreground">
          Explore nossos cursos e materiais para começar sua jornada jurídica
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cursos Destacados */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Cursos em Destaque
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={() => navigate('/cursos')}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-md" />
                  <Skeleton className="h-20 w-full rounded-md" />
                </>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{course.titulo || course.materia || 'Curso sem título'}</p>
                      <p className="text-sm text-muted-foreground">{course.descricao || course.sobre || ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhum curso encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questões Recentes */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Questões Recentes
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={() => navigate('/questoes')}>
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <>
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </>
              ) : recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div key={question.questao_id} className="flex items-center space-x-4">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Questão ID: {question.questao_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Visualizado em: {new Date(question.visualizado_em).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma questão visualizada recentemente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progresso do Usuário */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Seu Progresso
            </CardTitle>
            <Button variant="secondary" size="sm">
              Detalhes
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-12 w-full rounded-md" />
            ) : userProgress ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Progresso Total: {userProgress.progresso}%</p>
                <p className="text-sm text-muted-foreground">Continue aprendendo!</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum progresso registrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-8"
      >
        <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Explore nossos cursos, resolva questões e acompanhe seu progresso.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/cursos')}>
            Explorar Cursos
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/questoes')}>
            Resolver Questões
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default IniciandoNoDireito;
