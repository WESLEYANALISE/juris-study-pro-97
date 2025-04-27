
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
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 12}
          title="Diminuir fonte"
        >
          <ZoomOut size={16} />
        </Button>
      </motion.div>

      <motion.div
        className="px-2 py-1 border rounded-md bg-muted min-w-[40px] text-center"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {fontSize}
      </motion.div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 32}
          title="Aumentar fonte"
        >
          <ZoomIn size={16} />
        </Button>
      </motion.div>
    </div>
  );
};
