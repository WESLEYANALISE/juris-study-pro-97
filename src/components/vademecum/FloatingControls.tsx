
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Font size controls (left side) */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border flex flex-col gap-2">
          <Button 
            variant="purple" 
            size="icon" 
            onClick={increaseFontSize} 
            title="Aumentar tamanho da fonte"
          >
            <ZoomIn size={20} />
          </Button>
          
          <div className="text-center text-sm font-medium bg-muted/50 px-2 py-1 rounded-md">
            {fontSize}
          </div>
          
          <Button 
            variant="purple" 
            size="icon" 
            onClick={decreaseFontSize} 
            title="Diminuir tamanho da fonte"
          >
            <ZoomOut size={20} />
          </Button>
        </div>
      </div>
      
      {/* Back to top button (right side) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div 
            className="fixed right-4 bottom-20 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="purple" 
              size="icon"
              className="rounded-full h-12 w-12 shadow-lg"
              onClick={scrollToTop}
              title="Voltar ao topo"
            >
              <ArrowUp size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingControls;
