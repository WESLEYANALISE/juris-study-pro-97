import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ZoomIn, ZoomOut, Type } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <motion.div initial={{
      opacity: 0,
      x: -20
    }} animate={{
      opacity: 0.8,
      x: 0
    }} whileHover={{
      opacity: 1
    }} className="fixed left-4 bottom-16 z-50 bg-background/80 backdrop-blur shadow-lg rounded-full p-1 flex items-center gap-1 px-[3px] mx-0 my-[39px]">
        <Button variant="ghost" size="icon" onClick={decreaseFontSize} className="h-8 w-8 rounded-full" title="Diminuir fonte">
          <ZoomOut size={16} />
        </Button>
        
        <span className="text-xs font-medium px-1">{fontSize}px</span>
        
        <Button variant="ghost" size="icon" onClick={increaseFontSize} className="h-8 w-8 rounded-full" title="Aumentar fonte">
          <ZoomIn size={16} />
        </Button>
      </motion.div>
      
      {/* Back to top button (right side) - more discrete */}
      {showBackToTop && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 0.8,
      y: 0
    }} whileHover={{
      opacity: 1
    }} className="fixed right-4 bottom-16 z-50">
          <Button variant="outline" size="sm" onClick={scrollToTop} title="Voltar ao topo" className="rounded-full h-10 w-10 shadow-md bg-background/80 backdrop-blur mx-[13px] my-[38px]">
            <ArrowUp size={16} />
          </Button>
        </motion.div>}
    </>;
};
export default FloatingControls;