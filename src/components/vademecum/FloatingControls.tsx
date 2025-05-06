
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ArrowUp, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingControlsProps {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
}

export function FloatingControls({
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  showBackToTop,
  scrollToTop
}: FloatingControlsProps) {
  const [audioMode, setAudioMode] = React.useState(false);
  
  const toggleAudioMode = () => {
    setAudioMode(!audioMode);
    // In a real implementation, this would start audio narration
  };
  
  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col gap-3 items-end">
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="primary"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full shadow-lg h-11 w-11 pulse-ring"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className={cn(
          "flex gap-2 p-2 rounded-lg backdrop-blur-xl",
          "bg-background/50 border border-primary/20",
          "shadow-lg"
        )}
      >
        <Button
          variant="glass"
          size="sm"
          onClick={decreaseFontSize}
          disabled={fontSize <= 12}
          className="h-10 w-10 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="min-w-9 h-10 flex items-center justify-center font-medium text-sm bg-primary/10 rounded-md border border-primary/10">
          {fontSize}
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={increaseFontSize}
          disabled={fontSize >= 24}
          className="h-10 w-10 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 my-auto bg-primary/20"></div>
        
        <Button
          variant={audioMode ? "primary" : "glass"}
          size="sm"
          onClick={toggleAudioMode}
          className={cn(
            "h-10 w-10 p-0", 
            audioMode && "pulse-ring"
          )}
        >
          <Headphones className="h-4 w-4" />
          
          {audioMode && (
            <div className="absolute -right-1 -top-1 flex space-x-[1px]">
              <div className="w-[2px] h-2 bg-current animate-sound-wave"></div>
              <div className="w-[2px] h-3 bg-current animate-sound-wave delay-100"></div>
              <div className="w-[2px] h-2 bg-current animate-sound-wave delay-200"></div>
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
