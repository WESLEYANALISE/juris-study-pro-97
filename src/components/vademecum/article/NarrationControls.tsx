
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextToSpeechService } from '@/services/textToSpeechService';

interface NarrationControlsProps {
  text: string;
  isNarrating: boolean;
  setIsNarrating: (narrating: boolean) => void;
}

export const NarrationControls = ({ text, isNarrating, setIsNarrating }: NarrationControlsProps) => {
  const handleNarration = async () => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      await TextToSpeechService.speak(text);
      setIsNarrating(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleNarration}
        className={isNarrating ? 'bg-primary text-primary-foreground border-primary' : ''}
      >
        {isNarrating ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
};
