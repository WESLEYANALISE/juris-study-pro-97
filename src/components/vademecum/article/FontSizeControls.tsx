
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface FontSizeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const FontSizeControls = ({ fontSize, onFontSizeChange }: FontSizeControlsProps) => {
  // Function to handle font size decrease with validation
  const decreaseFontSize = () => {
    if (fontSize > 12) {
      onFontSizeChange(fontSize - 1);
    }
  };

  // Function to handle font size increase with validation
  const increaseFontSize = () => {
    if (fontSize < 32) {
      onFontSizeChange(fontSize + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={decreaseFontSize}
          disabled={fontSize <= 12}
          className="h-9 w-9 bg-background/90 border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          title="Diminuir fonte"
          aria-label="Diminuir tamanho da fonte"
        >
          <ZoomOut size={16} />
        </Button>
      </motion.div>

      <motion.div
        className="px-3 py-1 border rounded-md bg-muted min-w-[40px] text-center text-sm font-medium"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
      >
        {fontSize}
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={increaseFontSize}
          disabled={fontSize >= 32}
          className="h-9 w-9 bg-background/90 border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          title="Aumentar fonte"
          aria-label="Aumentar tamanho da fonte"
        >
          <ZoomIn size={16} />
        </Button>
      </motion.div>
    </div>
  );
};
