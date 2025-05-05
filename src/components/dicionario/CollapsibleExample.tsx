
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleExampleProps {
  example: string;
  className?: string;
}

export function CollapsibleExample({ example, className }: CollapsibleExampleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!example) return null;
  
  return (
    <div className={cn("mt-3 border-t pt-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-sm font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Exemplo de uso</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted/50 rounded-md my-2 text-sm italic">
              {example}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
