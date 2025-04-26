
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TermoPopular {
  id: string;
  termo: string;
  definicao: string;
}

interface TermosPopularesProps {
  termos: TermoPopular[];
  isLoading: boolean;
  onTermoSelect: (termo: string) => void;
  className?: string;
}

export const TermosPopulares: React.FC<TermosPopularesProps> = ({
  termos,
  isLoading,
  onTermoSelect,
  className
}) => {
  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Termos Mais Vistos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted/60 rounded w-full"></div>
                <div className="h-3 bg-muted/60 rounded w-5/6 mt-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Termos Mais Vistos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-60px)] px-6 pb-6">
          {termos.length > 0 ? (
            <div className="space-y-4">
              {termos.map((termo) => (
                <div
                  key={termo.id}
                  onClick={() => onTermoSelect(termo.termo)}
                  className="cursor-pointer group"
                >
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {termo.termo}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                    {termo.definicao}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum termo visualizado ainda
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
