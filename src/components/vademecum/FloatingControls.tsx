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
  return <>
      {/* Font size controls (bottom side) */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-purple-100 dark:border-purple-900/40 flex items-center p-1.5 gap-2">
          <Button variant="ghost" size="sm" onClick={decreaseFontSize} className="h-8 w-8 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40" title="Diminuir zoom">
            <ZoomOut size={16} />
          </Button>
          
          <div className="text-center py-1 text-xs font-medium min-w-[24px]">
            {fontSize}
          </div>
          
          <Button variant="ghost" size="sm" onClick={increaseFontSize} className="h-8 w-8 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40" title="Aumentar zoom">
            <ZoomIn size={16} />
          </Button>
        </div>
      </motion.div>
      
      {/* Back to top button (right side) */}
      <AnimatePresence>
        {showBackToTop && <motion.div className="fixed right-4 bottom-20 z-50" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.8
      }} transition={{
        duration: 0.2
      }}>
            <Button variant="purple" size="icon" onClick={scrollToTop} title="Voltar ao topo" className="rounded-full h-10 w-10 shadow-lg my-[20px]">
              <ArrowUp size={18} />
            </Button>
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default FloatingControls;