
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseCategories } from '@/components/cursos/CourseCategories';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Star, Clock, TrendingUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import { Curso } from '@/types/curso';
import { safeSelect } from '@/utils/supabase-helpers';

const Cursos = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch courses from cursos_narrados table
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', selectedCategory, debouncedSearchQuery],
    queryFn: async () => {
      try {
        // Use our safer select function
        const { data, error } = await safeSelect<Curso>(
          'cursos_narrados',
          '*',
          query => {
            let result = query;
            
            // Apply category filter if selected
            if (selectedCategory) {
              result = result.eq('categoria', selectedCategory);
            }
            
            // Apply search filter if there's a search query
            if (debouncedSearchQuery) {
              result = result.or(
                `titulo.ilike.%${debouncedSearchQuery}%,descricao.ilike.%${debouncedSearchQuery}%,autor.ilike.%${debouncedSearchQuery}%,materia.ilike.%${debouncedSearchQuery}%,area.ilike.%${debouncedSearchQuery}%`
              );
            }
            
            return result;
          }
        );
        
        if (error) {
          throw error;
        }
        
        // Handle and return the data safely
        return data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [] as Curso[];
      }
    },
    enabled: true, // Always fetch some courses, filter on client side
  });
  
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  const handleClearCategory = () => {
    setSelectedCategory(null);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the debounced query
  };

  const handleStartCourse = (courseId: number) => {
    navigate(`/cursos/viewer/${courseId}`);
  };

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
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Cursos Jurídicos</h1>
        <p className="text-lg text-muted-foreground">
          Aprofunde seus conhecimentos com nossos cursos especializados
        </p>
      </motion.div>
      
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar cursos por título, área ou instrutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Buscar</Button>
        </form>
      </div>
      
      {/* Course filters */}
      <Tabs defaultValue="categorias" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="populares" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Mais Populares</span>
          </TabsTrigger>
          <TabsTrigger value="recentes" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Recém Adicionados</span>
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Tendências</span>
          </TabsTrigger>
          <TabsTrigger value="meus-cursos" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Meus Cursos</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categorias">
          {selectedCategory ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cursos na Categoria Selecionada</h2>
                <Button variant="outline" onClick={handleClearCategory}>
                  Voltar para Categorias
                </Button>
              </div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Carregando cursos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses && courses.length > 0 ? (
                    courses.map((course) => {
                      const courseMenuProps = mapCursoToCourseMenu(course);
                      return (
                        <CourseMenu 
                          key={course.id}
                          {...courseMenuProps}
                          onStartCourse={() => handleStartCourse(course.id)}
                          // Required props
                          open={false}
                          onOpenChange={() => {}}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <p>Nenhum curso encontrado nesta categoria.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <CourseCategories onSelectCategory={handleSelectCategory} />
          )}
        </TabsContent>
        
        <TabsContent value="populares">
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium mb-2">Cursos Mais Populares</h3>
            <p className="text-muted-foreground">
              Os cursos com melhor avaliação e maior número de alunos.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="recentes">
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium mb-2">Cursos Recém Adicionados</h3>
            <p className="text-muted-foreground">
              Conteúdos mais recentes adicionados à nossa plataforma.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="tendencias">
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium mb-2">Cursos em Alta</h3>
            <p className="text-muted-foreground">
              Descubra os cursos que estão ganhando popularidade rapidamente.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="meus-cursos">
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium mb-2">Meus Cursos</h3>
            <p className="text-muted-foreground">
              Cursos que você iniciou ou completou.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cursos;
