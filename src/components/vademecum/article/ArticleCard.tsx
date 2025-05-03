import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleContent } from './ArticleContent';
import { ArticleDetails } from './ArticleDetails';
import { cn } from '@/lib/utils';
import { ArticleActions } from './ArticleActions';
interface ArticleCardProps {
  articleId: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  lawName: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteIcon?: React.ReactNode;
  fontSize?: number;
}
export const ArticleCard: React.FC<ArticleCardProps> = ({
  articleId,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  lawName,
  isFavorite = false,
  onToggleFavorite,
  favoriteIcon,
  fontSize = 16
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const hasDetails = technicalExplanation || formalExplanation || practicalExample;
  const isHeading = !articleNumber && articleText?.includes('TÍTULO') || articleText?.includes('CAPÍTULO');

  // Toggle expanded state with animation
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
    if (isExpanded) {
      setShowDetails(false);
    }
  };

  // Toggle details panel
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(prev => !prev);
  };
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <Card className={cn("shadow-sm hover:shadow-md transition-all overflow-hidden border", isHeading ? "bg-muted/30" : "", isFavorite ? "border-primary" : "")}>
        <div className={cn("cursor-pointer", isHeading ? "py-3 px-4" : "p-4")} onClick={toggleExpanded}>
          <div className="flex justify-between items-start">
            <ArticleContent articleNumber={articleNumber} articleText={articleText} fontSize={fontSize} isHeading={isHeading} />
            
            <div className="flex items-center gap-2">
              {/* Favorite button */}
              {onToggleFavorite && <Button variant={isFavorite ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={e => {
              e.stopPropagation();
              onToggleFavorite();
            }} title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                  {favoriteIcon}
                </Button>}
              
              {/* Expand button */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleExpanded} title={isExpanded ? "Recolher" : "Expandir"}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Expandable content */}
        {isExpanded}
      </Card>
    </motion.div>;
};

// AnimatePresence component for animations
const AnimatePresence: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  return <>{children}</>;
};