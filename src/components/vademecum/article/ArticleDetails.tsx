
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleDetailsProps {
  articleNumber: string;
  lawName: string;
  lawType?: string;
  isExpanded?: boolean;
  // Add the missing properties that ArticleCard is trying to pass
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  onClose?: () => void;
}

export const ArticleDetails: React.FC<ArticleDetailsProps> = ({
  articleNumber,
  lawName,
  lawType = "Lei",
  isExpanded = false,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  onClose
}) => {
  const displayLawName = lawName.replace(/_/g, ' ');
  
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="font-mono">
            Art. {articleNumber}
          </Badge>
        </div>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">{lawType}</span>
            </div>
            <h4 className="font-medium">{displayLawName}</h4>
            
            {technicalExplanation && (
              <div className="mt-2">
                <h5 className="text-sm font-medium mb-1">Explicação Técnica:</h5>
                <p className="text-sm text-muted-foreground">{technicalExplanation}</p>
              </div>
            )}
            
            {formalExplanation && (
              <div className="mt-2">
                <h5 className="text-sm font-medium mb-1">Explicação Formal:</h5>
                <p className="text-sm text-muted-foreground">{formalExplanation}</p>
              </div>
            )}
            
            {practicalExample && (
              <div className="mt-2">
                <h5 className="text-sm font-medium mb-1">Exemplo Prático:</h5>
                <p className="text-sm text-muted-foreground">{practicalExample}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetails;
