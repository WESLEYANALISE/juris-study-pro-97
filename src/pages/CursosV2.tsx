import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Curso } from '@/types/curso';

// Components
import { CourseAreaSection } from '@/components/cursos/CourseAreaSection';
import { CourseFilters } from '@/components/cursos/CourseFilters';
import { PopularCoursesList } from '@/components/cursos/PopularCoursesList';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { DataCard } from '@/components/ui/data-card';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Bookmark, Clock, Star, TrendingUp, History } from 'lucide-react';
import { CourseCard } from '@/components/cursos/CourseCard';

const CursosV2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial category if provided from state
  const initialCategory = location.state?.selectedCategory || null;
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('todas');
  
  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch courses from Supabase
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-v2', selectedArea, selectedDifficulty, debouncedSearchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from('cursos_narrados')
          .select('*');
        
        // Apply area filter
        if (selectedArea) {
          query = query.eq('area', selectedArea);
        }
        
        // Apply difficulty filter
        if (selectedDifficulty !== 'todas') {
          // Handle accent-insensitive comparison
          const pattern = selectedDifficulty.replace(/á/g, 'a').replace(/í/g, 'i');
          query = query.ilike('dificuldade', `%${pattern}%`);
        }
        
        // Apply search query
        if (debouncedSearchQuery) {
          query = query.or(`materia.ilike.%${debouncedSearchQuery}%,sobre.ilike.%${debouncedSearchQuery}%`);
        }
        
        // Sort by area and sequence
        query = query.order('area').order('sequencia');
        
        const { data: fetchedCourses, error } = await query;
        
        if (error) throw error;
        
        // Map to Curso type and convert sequencia to number
        const mappedCourses = fetchedCourses?.map(course => ({
          ...course,
          sequencia: course.sequencia ? parseInt(course.sequencia) : 0,
          titulo: course.materia, // Map materia to titulo for compatibility
          thumbnail: course.capa, // Map capa to thumbnail for compatibility
        })) as Curso[];
        
        return mappedCourses || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    }
  });
  
  // Get bookmarked courses IDs
  const bookmarkedCoursesIds = useMemo(() => {
    const bookmarks = localStorage.getItem('curso_bookmarks');
    return bookmarks ? JSON.parse(bookmarks) : [];
  }, []);
  
  // Get recent courses based on progress in localStorage
  const recentCourses = useMemo(() => {
    if (!courses) return [];
    
    // Get all progress entries from localStorage
    const progressEntries = Object.entries(localStorage)
      .filter(([key]) => key.startsWith('curso_') && key.endsWith('_progress'))
      .map(([key, value]) => {
        const courseId = parseInt(key.replace('curso_', '').replace('_progress', ''));
        return {
          courseId,
          progress: parseInt(value)
        };
      })
      .sort((a, b) => b.progress - a.progress);
    
    // Map to actual course objects
    return progressEntries
      .map(entry => courses.find(course => course.id === entry.courseId))
      .filter(Boolean) as Curso[];
  }, [courses]);
  
  // Group courses by area
  const coursesByArea = useMemo(() => {
    if (!courses || courses.length === 0) return {};
    
    return courses.reduce<Record<string, Curso[]>>((acc, course) => {
      const area = course.area || 'Outras áreas';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(course);
      return acc;
    }, {});
  }, [courses]);
  
  // Get all unique areas
  const areas = useMemo(() => {
    return Object.keys(coursesByArea).sort();
  }, [coursesByArea]);
  
  // Get bookmarked courses
  const bookmarkedCourses = useMemo(() => {
    if (!courses || courses.length === 0 || !bookmarkedCoursesIds?.length) return [];
    return courses.filter(course => bookmarkedCoursesIds.includes(course.id));
  }, [courses, bookmarkedCoursesIds]);
  
  // Get popular courses (for now we'll use a simple algorithm)
  const popularCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    
    // For now, we'll consider the first courses from each area as popular
    return Object.values(coursesByArea)
      .flatMap(areaCourses => areaCourses.slice(0, 1))
      .slice(0, 5);
  }, [coursesByArea]);
  
  // Check if filters are active
  const isFiltering = useMemo(() => {
    return !!searchQuery || !!selectedArea || selectedDifficulty !== 'todas';
  }, [searchQuery, selectedArea, selectedDifficulty]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArea(null);
    setSelectedDifficulty('todas');
  };
  
  // Determine if we have results with current filters
  const hasFilteredResults = courses && courses.length > 0;
  
  return (
    <JuridicalBackground variant="books" opacity={0.02}>
      <Container className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Cursos Jurídicos</h1>
            <p className="text-lg text-muted-foreground">
              Aprofunde seus conhecimentos com cursos especializados em diversas áreas do direito
            </p>
          </div>
        </motion.div>
        
        <Tabs defaultValue={bookmarkedCourses.length > 0 ? "salvos" : "todos"} className="space-y-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="todos" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Todos os Cursos</span>
              </TabsTrigger>
              <TabsTrigger value="salvos" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                <span>Salvos</span>
              </TabsTrigger>
              <TabsTrigger value="recentes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Recentes</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* All Courses Tab */}
          <TabsContent value="todos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <CourseFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  selectedArea={selectedArea}
                  setSelectedArea={setSelectedArea}
                  areas={areas}
                  clearFilters={clearFilters}
                  filtering={isFiltering}
                />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-[280px] bg-muted/20 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : hasFilteredResults ? (
                  <>
                    {/* If filtering, show a flat list of results */}
                    {isFiltering ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">
                          {courses.length} {courses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courses.map((course, index) => (
                            <CourseCard key={course.id} course={course} index={index} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      // If not filtering, show courses grouped by area
                      <>
                        {Object.entries(coursesByArea).map(([area, areaCourses]) => (
                          <CourseAreaSection key={area} area={area} courses={areaCourses} compact />
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <DataCard
                    title="Nenhum curso encontrado"
                    variant="warning"
                    className="max-w-2xl mx-auto"
                  >
                    <div className="space-y-4 py-4">
                      <p className="text-center">
                        Não encontramos cursos com os filtros selecionados. Tente ajustar seus critérios de busca.
                      </p>
                      <div className="flex justify-center">
                        <Button onClick={clearFilters}>Limpar filtros</Button>
                      </div>
                    </div>
                  </DataCard>
                )}
              </div>
              
              <div>
                <JuridicalCard
                  title="Cursos em Destaque"
                  description="Mais populares da plataforma"
                  icon="book"
                  variant="primary"
                  className="mb-6"
                >
                  <PopularCoursesList
                    courses={popularCourses}
                    loading={isLoading}
                  />
                </JuridicalCard>
              </div>
            </div>
          </TabsContent>
          
          {/* Bookmarked Courses Tab */}
          <TabsContent value="salvos">
            {bookmarkedCourses.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Cursos Salvos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bookmarkedCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <DataCard
                title="Nenhum curso salvo"
                variant="default" 
                className="max-w-2xl mx-auto"
              >
                <div className="space-y-4 py-4">
                  <p className="text-center">
                    Você ainda não salvou nenhum curso como favorito.
                    Use o botão "Marcador" durante a visualização de um curso para salvá-lo nesta lista.
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={() => navigate('/cursos')}>
                      Explorar Cursos
                    </Button>
                  </div>
                </div>
              </DataCard>
            )}
          </TabsContent>
          
          {/* Recent Courses Tab */}
          <TabsContent value="recentes">
            {recentCourses.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Cursos Recentes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <DataCard 
                title="Nenhum curso recente"
                variant="default"
                className="max-w-2xl mx-auto"
              >
                <div className="space-y-4 py-4">
                  <p className="text-center">
                    Você ainda não assistiu a nenhum curso.
                    Comece a explorar nossos cursos para ver seu progresso aqui.
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={() => navigate('/cursos')}>
                      Explorar Cursos
                    </Button>
                  </div>
                </div>
              </DataCard>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </JuridicalBackground>
  );
};

export default CursosV2;
