
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
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border flex flex-col p-1"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={increaseFontSize}
            className="h-8 w-8"
            title="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </Button>
          
          <div className="text-center py-1 text-xs font-medium">
            {fontSize}%
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={decreaseFontSize}
            className="h-8 w-8" 
            title="Diminuir zoom"
          >
            <ZoomOut size={16} />
          </Button>
        </motion.div>
      </div>
      
      {/* Back to top button (right side) */}
      <AnimatePresence>
        {showBackToTop && 
          <motion.div 
            className="fixed right-4 bottom-20 z-50" 
            initial={{
              opacity: 0,
              scale: 0.8
            }} 
            animate={{
              opacity: 1,
              scale: 1
            }} 
            exit={{
              opacity: 0,
              scale: 0.8
            }} 
            transition={{
              duration: 0.2
            }}
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
        }
      </AnimatePresence>
    </>
  );
};

export default FloatingControls;
