
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextToSpeechService } from '@/services/textToSpeechService';

interface NarrationControlsProps {
  text: string;
  isNarrating: boolean;
  setIsNarrating: (narrating: boolean) => void;
  showLabel?: boolean;
}

export const NarrationControls = ({ text, isNarrating, setIsNarrating, showLabel = false }: NarrationControlsProps) => {
  const handleNarration = async () => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      // Modify the speak method to use pt-BR-Wavenet-D voice
      await TextToSpeechService.speak(text, 'pt-BR-Wavenet-D');
      setIsNarrating(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button 
        variant="outline" 
        size={showLabel ? "sm" : "icon"} 
        onClick={handleNarration}
        className={`${isNarrating ? 'bg-primary text-primary-foreground border-primary' : ''} ${showLabel ? 'flex gap-2' : ''}`}
      >
        {isNarrating ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {showLabel && (
          <span className="hidden sm:inline">
            {isNarrating ? 'Parar' : 'Narrar'}
          </span>
        )}
      </Button>
    </motion.div>
  );
};
