
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ArrowUp } from "lucide-react";
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
  scrollToTop,
}: FloatingControlsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
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
              className="rounded-full shadow-lg h-10 w-10"
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
          "flex gap-2 p-1.5 rounded-lg backdrop-blur-lg",
          "bg-background/50 border border-primary/20",
          "shadow-lg"
        )}
      >
        <Button
          variant="glass"
          size="sm"
          onClick={decreaseFontSize}
          disabled={fontSize <= 12}
          className="h-9 w-9 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="min-w-8 h-9 flex items-center justify-center font-medium text-sm bg-primary/10 rounded-md">
          {fontSize}
        </div>
        
        <Button
          variant="glass"
          size="sm"
          onClick={increaseFontSize}
          disabled={fontSize >= 24}
          className="h-9 w-9 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
