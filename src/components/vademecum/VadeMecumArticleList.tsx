
import { useState, useEffect } from 'react';
import { ArticleCard } from './ArticleCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useVadeMecumPreferences } from '@/hooks/useVadeMecumPreferences';
import { Search } from 'lucide-react';

interface VadeMecumArticleListProps {
  data: any[] | null;
  isLoading: boolean;
  filter: string;
  tableName: string;
  error?: any;
}

export function VadeMecumArticleList({
  data,
  isLoading,
  filter,
  tableName,
  error
}: VadeMecumArticleListProps) {
  const [filteredData, setFilteredData] = useState<any[] | null>(data);
  const { fontSize } = useVadeMecumPreferences();

  // Effect to filter data when data or filter changes
  useEffect(() => {
    if (!data) {
      setFilteredData(null);
      return;
    }

    if (!filter) {
      setFilteredData(data);
      return;
    }

    const lowerFilter = filter.toLowerCase();
    const filtered = data.filter((item) => {
      const articleText = item.artigo?.toLowerCase() || '';
      const articleNumber = item.numero?.toString().toLowerCase() || '';

      return (
        articleText.includes(lowerFilter) ||
        articleNumber.includes(lowerFilter)
      );
    });

    setFilteredData(filtered);
  }, [data, filter]);

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
        <h3 className="font-semibold mb-2">Erro ao carregar artigos</h3>
        <p>Ocorreu um erro ao carregar os artigos. Por favor, tente novamente.</p>
      </div>
    );
  }

  // Empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-xl font-semibold">Nenhum artigo encontrado</h3>
        <p className="text-muted-foreground">
          Tente outro termo de busca ou selecione outra legislação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredData.map((item, index) => (
        <ArticleCard
          key={index}
          id={item.id.toString()}
          lawId={tableName}
          articleNumber={item.numero}
          articleText={item.artigo}
          technicalExplanation={item.tecnica}
          formalExplanation={item.formal}
          practicalExample={item.exemplo}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}
