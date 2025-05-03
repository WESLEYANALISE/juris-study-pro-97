
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ZoomIn, ZoomOut, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      {/* Font size controls (bottom left) with purple transparent background */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.9, x: 0 }}
        whileHover={{ opacity: 1 }}
        className="fixed left-4 bottom-16 z-50 bg-[#9b87f5]/30 backdrop-blur shadow-lg rounded-full p-1 flex items-center gap-1 px-[3px] mx-0 my-[39px]"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={decreaseFontSize} 
              className="h-8 w-8 rounded-full hover:bg-[#9b87f5]/20" 
              title="Diminuir fonte"
            >
              <ZoomOut size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diminuir fonte</TooltipContent>
        </Tooltip>
        
        <span className="text-xs font-medium px-1">{fontSize}px</span>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={increaseFontSize} 
              className="h-8 w-8 rounded-full hover:bg-[#9b87f5]/20" 
              title="Aumentar fonte"
            >
              <ZoomIn size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Aumentar fonte</TooltipContent>
        </Tooltip>
      </motion.div>
      
      {/* Back to top button (right side) with purple transparent background */}
      {showBackToTop && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.9, y: 0 }}
          whileHover={{ opacity: 1 }}
          className="fixed right-4 bottom-16 z-50"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={scrollToTop} 
                title="Voltar ao topo" 
                className="rounded-full h-10 w-10 shadow-md bg-[#9b87f5]/30 backdrop-blur border-[#9b87f5]/30 hover:bg-[#9b87f5]/50 mx-[13px] my-[38px]"
              >
                <ArrowUp size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar ao topo</TooltipContent>
          </Tooltip>
        </motion.div>
      )}
    </TooltipProvider>
  );
};

export default FloatingControls;
