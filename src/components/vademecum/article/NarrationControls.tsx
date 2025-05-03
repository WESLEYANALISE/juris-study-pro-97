
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { toast } from 'sonner';

interface NarrationControlsProps {
  text: string;
  isNarrating: boolean;
  setIsNarrating: (narrating: boolean) => void;
  showLabel?: boolean;
}

export const NarrationControls = ({ text, isNarrating, setIsNarrating, showLabel = false }: NarrationControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleNarration = async () => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setIsNarrating(true);
      
      // Ensure voice is set to pt-BR-Wavenet-D
      await TextToSpeechService.speak(text, 'pt-BR-Wavenet-D');
      
      setIsNarrating(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast.error('Não foi possível iniciar a narração. Tente novamente.');
      setIsNarrating(false);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size={showLabel ? "sm" : "icon"} 
      onClick={handleNarration}
      className={`${isNarrating ? 'bg-primary/10 text-primary border-primary/20' : ''} ${showLabel ? 'flex gap-2' : ''}`}
      disabled={isLoading}
    >
      {isNarrating || isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && <span className="hidden sm:inline">Parar</span>}
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">Narrar</span>}
        </>
      )}
    </Button>
  );
};
