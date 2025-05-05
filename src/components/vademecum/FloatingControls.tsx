
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Settings, 
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingControlsProps {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  showBackToTop,
  scrollToTop
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  // Fixed position based on screen size
  const position = isMobile 
    ? "fixed bottom-20 right-4 z-50" 
    : "fixed bottom-8 right-8 z-50";

  return (
    <>
      {/* Back to top button - shows when scrolled down */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`${isMobile ? "fixed bottom-[90px] right-4" : "fixed bottom-24 right-8"} z-50`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={scrollToTop}
                    className="rounded-full shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Voltar ao topo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls panel */}
      <div className={position}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-3 flex flex-col items-center gap-2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={increaseFontSize}
                      className="rounded-full shadow-md"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Aumentar texto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="bg-card p-1 px-2 rounded-full text-sm font-medium border">
                {fontSize}px
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={decreaseFontSize}
                      className="rounded-full shadow-md"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Diminuir texto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <Button
          size="icon"
          variant={isExpanded ? "default" : "secondary"}
          className="rounded-full shadow-lg hover:shadow-xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <Type className="h-5 w-5" />
          )}
        </Button>
      </div>
    </>
  );
};

export default FloatingControls;
