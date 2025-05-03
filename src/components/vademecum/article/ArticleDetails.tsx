
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText } from 'lucide-react';

interface ArticleDetailsProps {
  articleNumber: string;
  lawName: string;
  lawType?: string;
  isExpanded?: boolean;
}

export const ArticleDetails: React.FC<ArticleDetailsProps> = ({
  articleNumber,
  lawName,
  lawType = "Lei",
  isExpanded = false
}) => {
  const displayLawName = lawName.replace(/_/g, ' ');
  
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="font-mono">
          Art. {articleNumber}
        </Badge>
      </div>
      
      {isExpanded && (
        <Card className="bg-muted/50">
          <CardContent className="p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">{lawType}</span>
            </div>
            <h4 className="font-medium">{displayLawName}</h4>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticleDetails;
