
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface FontSizeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const FontSizeControls = ({ fontSize, onFontSizeChange }: FontSizeControlsProps) => {
  return (
    <div className="flex items-center gap-1">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 12}
          className="h-8 w-8 bg-background/90 border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300"
          title="Diminuir fonte"
        >
          <ZoomOut size={14} />
        </Button>
      </motion.div>

      <motion.div
        className="px-2 py-0.5 border rounded-md bg-muted min-w-[32px] text-center text-xs"
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
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 32}
          className="h-8 w-8 bg-background/90 border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300"
          title="Aumentar fonte"
        >
          <ZoomIn size={14} />
        </Button>
      </motion.div>
    </div>
  );
};
