import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ZoomIn, ZoomOut, X } from 'lucide-react';
import { motion } from 'framer-motion';
interface FloatingControlsProps {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
  onClose?: () => void;
}
export const FloatingControls = ({
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  showBackToTop,
  scrollToTop,
  onClose
}: FloatingControlsProps) => {
  return <>
      {/* Font size controls (bottom left) */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 0.95,
      y: 0
    }} whileHover={{
      opacity: 1
    }} className="fixed left-4 bottom-16 z-50">
        
      </motion.div>
      
      {/* Back to top button (right side) */}
      {showBackToTop && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 0.95,
      y: 0
    }} whileHover={{
      opacity: 1
    }} className="fixed right-4 bottom-16 z-50">
          <Button variant="outline" size="sm" onClick={scrollToTop} title="Voltar ao topo" className="rounded-full h-10 w-10 shadow-md bg-[#9b87f5]/20 backdrop-blur mx-[13px] border border-[#9b87f5]/30 text-[#9b87f5] my-[55px]">
            <ArrowUp size={16} />
          </Button>
        </motion.div>}
      
      {/* Close button (top right) */}
      {onClose && <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 0.95,
      y: 0
    }} whileHover={{
      opacity: 1
    }} className="fixed right-4 top-4 z-50">
          <Button variant="outline" size="sm" onClick={onClose} title="Fechar" className="rounded-full h-10 w-10 shadow-md bg-[#9b87f5]/20 backdrop-blur border border-[#9b87f5]/30 text-[#9b87f5]">
            <X size={16} />
          </Button>
        </motion.div>}
    </>;
};
export default FloatingControls;