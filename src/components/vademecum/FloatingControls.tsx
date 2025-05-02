
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ZoomIn, ZoomOut, Type } from 'lucide-react';

interface FloatingControlsProps {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
}

export const FloatingControls = ({
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  showBackToTop,
  scrollToTop
}: FloatingControlsProps) => {
  return (
    <>
      {/* Font size controls (bottom left) - more discrete design */}
      <div 
        className="fixed left-4 bottom-16 z-50 opacity-60 hover:opacity-90 transition-opacity"
      >
        <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow-sm border border-border/50 flex flex-col items-center p-1 gap-1">
          <div className="text-xs font-medium text-center text-muted-foreground mb-0.5">
            <Type size={12} className="inline mr-1" />
            <span>Fonte</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={increaseFontSize} 
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" 
            title="Aumentar fonte"
          >
            <ZoomIn size={14} />
          </Button>
          
          <div className="text-center py-0.5 text-xs font-medium min-w-[20px]">
            {fontSize}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={decreaseFontSize} 
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" 
            title="Diminuir fonte"
          >
            <ZoomOut size={14} />
          </Button>
        </div>
      </div>
      
      {/* Back to top button (right side) - more discrete */}
      {showBackToTop && (
        <div 
          className="fixed right-4 bottom-16 z-50 opacity-60 hover:opacity-90 transition-opacity" 
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToTop} 
            title="Voltar ao topo" 
            className="rounded-full h-8 w-8 shadow-sm"
          >
            <ArrowUp size={16} />
          </Button>
        </div>
      )}
    </>
  );
};

export default FloatingControls;
