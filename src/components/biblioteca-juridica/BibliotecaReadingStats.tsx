
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, LineChart, BookMarked, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface BibliotecaReadingStatsProps {
  books: LivroJuridico[];
}

export function BibliotecaReadingStats({ books }: BibliotecaReadingStatsProps) {
  const { getReadingProgress, getFavorites } = useBibliotecaProgresso();
  
  // Books in progress
  const booksInProgress = useMemo(() => {
    return books.filter(book => {
      const progress = getReadingProgress(book.id);
      return progress && progress.pagina_atual > 1;
    });
  }, [books, getReadingProgress]);
  
  // Books by category
  const booksByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    books.forEach(book => {
      const category = book.categoria || 'Outros';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [books]);
  
  // Reading progress chart data
  const readingProgressData = useMemo(() => {
    return booksInProgress
      .map(book => {
        const progress = getReadingProgress(book.id);
        const percentage = progress && book.total_paginas 
          ? Math.round((progress.pagina_atual / book.total_paginas) * 100)
          : 0;
        
        return {
          name: book.titulo.length > 20 ? book.titulo.substring(0, 20) + '...' : book.titulo,
          progress: percentage,
          pages: progress ? progress.pagina_atual : 0,
          total: book.total_paginas || 0
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [booksInProgress, getReadingProgress]);
  
  // Calculate total pages read
  const totalPagesRead = useMemo(() => {
    return booksInProgress.reduce((total, book) => {
      const progress = getReadingProgress(book.id);
      return total + (progress?.pagina_atual || 0);
    }, 0);
  }, [booksInProgress, getReadingProgress]);
  
  // Calculate total pages in collection
  const totalPagesInCollection = useMemo(() => {
    return books.reduce((total, book) => {
      return total + (book.total_paginas || 0);
    }, 0);
  }, [books]);
  
  // Chart colors
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Livros em progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{booksInProgress.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De {books.length} na biblioteca
              </p>
              <Progress 
                value={books.length > 0 ? (booksInProgress.length / books.length) * 100 : 0} 
                className="h-1 mt-2" 
              />
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Páginas lidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPagesRead}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De {totalPagesInCollection} totais
              </p>
              <Progress 
                value={totalPagesInCollection > 0 ? (totalPagesRead / totalPagesInCollection) * 100 : 0} 
                className="h-1 mt-2" 
              />
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-primary" />
                Livros favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getFavorites().length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De {books.length} na biblioteca
              </p>
              <Progress 
                value={books.length > 0 ? (getFavorites().length / books.length) * 100 : 0} 
                className="h-1 mt-2" 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Progresso de leitura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readingProgressData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={readingProgressData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value}%`, 'Progresso']}
                        labelFormatter={(label: string) => label}
                      />
                      <Bar dataKey="progress" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center flex-col">
                  <Calendar className="h-12 w-12 text-muted-foreground/40 mb-2" />
                  <p className="text-muted-foreground text-center">
                    Nenhum livro em progresso.<br />
                    Comece a ler para ver estatísticas.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Distribuição por categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booksByCategory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={booksByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {booksByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} livros`, 'Quantidade']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhuma categoria disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
