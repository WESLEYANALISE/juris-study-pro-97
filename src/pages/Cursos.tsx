
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseCategories } from '@/components/cursos/CourseCategories';
import { CourseMenu } from '@/components/cursos/CourseMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Star, Clock, TrendingUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Course {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  autor: string;
  duracao: string;
  modulos: number;
  avaliacao: number;
  alunos: number;
  thumbnail: string;
}

const Cursos = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Optional: Replace with actual course data from Supabase when available
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', selectedCategory],
    queryFn: async () => {
      try {
        // This is a placeholder - replace with actual Supabase query
        // const { data, error } = await supabase
        //   .from('cursos')
        //   .select('*')
        //   .eq('categoria', selectedCategory);
        
        // Placeholder data
        return [{
          id: 1,
          titulo: 'Introdução ao Direito Civil',
          descricao: 'Conceitos fundamentais de Direito Civil',
          categoria: 'direito-civil',
          autor: 'Dr. Paulo Santos',
          duracao: '10h',
          modulos: 8,
          avaliacao: 4.8,
          alunos: 1250,
          thumbnail: 'https://via.placeholder.com/300x200',
        }] as Course[];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [] as Course[];
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
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  const handleStartCourse = () => {
    console.log('Starting course');
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
                  {courses?.map((course) => (
                    <CourseMenu 
                      key={course.id}
                      title={course.titulo}
                      description={course.descricao}
                      onStartCourse={handleStartCourse}
                    />
                  ))}
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
