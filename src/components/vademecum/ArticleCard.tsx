
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume, VolumeX } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    numero?: string;
    artigo: string;
    tecnica?: string;
    formal?: string;
    exemplo?: string;
  };
  isCurrentlyNarrating: boolean;
  onNarrate: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isCurrentlyNarrating,
  onNarrate,
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border border-border hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{article.numero || ''}</h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onNarrate}
          title={isCurrentlyNarrating ? "Parar narração" : "Narrar artigo"}
        >
          {isCurrentlyNarrating ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className={article.numero ? "text-left" : "text-center"}>
        {article.artigo}
      </p>
    </div>
  );
};

export default ArticleCard;
