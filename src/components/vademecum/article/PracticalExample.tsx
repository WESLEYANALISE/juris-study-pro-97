
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PracticalExampleProps {
  example: string;
  onNarration: (text: string) => Promise<void>;
}

export const PracticalExample = ({ example, onNarration }: PracticalExampleProps) => {
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Texto copiado para a área de transferência');
  };

  const formatText = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {para.trim()}
      </p>
    ));
  };

  return (
    <ScrollArea className="h-full max-h-[350px]">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Exemplo</h4>
          <div className="space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onNarration(example)}>
              <Volume2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(example)}>
              <Copy size={14} />
            </Button>
          </div>
        </div>
        <div className="text-sm">
          {formatText(example)}
        </div>
      </div>
    </ScrollArea>
  );
};
