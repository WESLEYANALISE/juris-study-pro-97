import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Lightbulb, Search, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Curso } from '@/types/curso';
import { SupabaseHistoryEntry, SupabaseUserProgress } from '@/types/supabase';
import { safeSelect } from '@/utils/supabase-helpers';

// Define local interfaces to avoid collision with imported types
interface HistoricoQuestaoItem {
  questao_id: string;
  visualizado_em: string;
}

interface ProgressoUsuarioItem {
  progresso: number;
  concluido?: boolean;
  ultimo_acesso?: string;
}

const IniciandoNoDireito = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<HistoricoQuestaoItem[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressoUsuarioItem | null>(null);
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
        const { data: coursesData, error: coursesError } = await safeSelect<Curso>(
          'cursos_narrados',
          '*',
          query => query.limit(3)
        );

        if (coursesError) {
          console.error('Erro ao buscar cursos:', coursesError);
        } else if (coursesData) {
          setCourses(coursesData);
        }

        // For user progress
        if (user) {
          const { data: progressData, error: progressError } = await safeSelect<SupabaseUserProgress>(
            'progresso_usuario',
            '*',
            query => query.eq('user_id', user.id).limit(1)
          );
          
          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Erro ao buscar progresso:', progressError);
          } else if (progressData && progressData.length > 0) {
            setUserProgress({
              progresso: progressData[0].progresso,
              concluido: progressData[0].concluido,
              ultimo_acesso: progressData[0].ultimo_acesso
            });
          }
        }

        // For question history
        if (user) {
          const { data: questionsData, error: questionsError } = await safeSelect<SupabaseHistoryEntry>(
            'historico_questoes',
            'questao_id, visualizado_em',
            query => query
              .eq('user_id', user.id)
              .order('visualizado_em', { ascending: false })
              .limit(5)
          );
          
          if (questionsError) {
            console.error('Erro ao buscar questões recentes:', questionsError);
          } else if (questionsData) {
            const formattedQuestions: HistoricoQuestaoItem[] = questionsData.map(item => ({
              questao_id: String(item.questao_id),
              visualizado_em: String(item.visualizado_em)
            }));
            setRecentQuestions(formattedQuestions);
          }
        }

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
