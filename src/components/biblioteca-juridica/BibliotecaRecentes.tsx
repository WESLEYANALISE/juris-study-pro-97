
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { BibliotecaGridView } from './BibliotecaGridView';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Clock } from 'lucide-react';

interface BibliotecaRecentesProps {
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaRecentes({
  onSelectBook
}: BibliotecaRecentesProps) {
  const { user } = useAuth();

  const { data: recentBooks, isLoading } = useQuery({
    queryKey: ['biblioteca-recentes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get user's recent books
        const { data: progressData, error: progressError } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('livro_id, ultima_leitura')
          .eq('user_id', user.id)
          .order('ultima_leitura', { ascending: false })
          .limit(5);
        
        if (progressError) throw progressError;
        
        if (!progressData || progressData.length === 0) return [];
        
        // Get book details for recents
        const recentIds = progressData.map(item => item.livro_id);
        const { data: booksData, error: booksError } = await supabase
          .from('biblioteca_juridica10')
          .select('*')
          .in('id', recentIds);
        
        if (booksError) throw booksError;
        
        // Sort books in the order of recency
        const booksById = (booksData || []).reduce((acc, book) => {
          acc[book.id] = book;
          return acc;
        }, {} as Record<string, any>);
        
        // Convert to LivroJuridico type
        return progressData
          .map(item => booksById[item.livro_id])
          .filter(Boolean) as unknown as LivroJuridico[];
      } catch (err) {
        console.error('Error fetching recent books:', err);
        return [];
      }
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!recentBooks || recentBooks.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center border border-dashed rounded-lg">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum livro visualizado recentemente</h3>
        <p className="text-muted-foreground max-w-sm">
          Os livros que você visualizar aparecerão aqui para acesso rápido
        </p>
      </div>
    );
  }

  return (
    <BibliotecaGridView 
      books={recentBooks}
      onSelectBook={onSelectBook}
    />
  );
}
