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
  return <>
      {/* Font size controls (bottom left) - more discrete design */}
      <div className="fixed left-4 bottom-16 z-50 opacity-60 hover:opacity-90 transition-opacity">
        
      </div>
      
      {/* Back to top button (right side) - more discrete */}
      {showBackToTop && <div className="fixed right-4 bottom-16 z-50 opacity-60 hover:opacity-90 transition-opacity">
          <Button variant="outline" size="sm" onClick={scrollToTop} title="Voltar ao topo" className="rounded-full h-8 w-8 shadow-sm">
            <ArrowUp size={16} />
          </Button>
        </div>}
    </>;
};
export default FloatingControls;