
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';

interface NarrationControlsProps {
  text: string;
  isNarrating: boolean;
  setIsNarrating: (narrating: boolean) => void;
  showLabel?: boolean;
}

export const NarrationControls = ({ 
  text, 
  isNarrating, 
  setIsNarrating, 
  showLabel = false 
}: NarrationControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1.0);

  const handleNarration = async () => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setIsNarrating(true);
      
      // Use the updated service with Google TTS
      await TextToSpeechService.speak(text, { rate });
      
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
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={showLabel ? "sm" : "icon"} 
          className={cn(
            "gap-1.5 text-xs font-normal text-primary/80 hover:text-primary hover:bg-primary/5",
            isNarrating && "bg-primary/10 text-primary",
            showLabel ? "" : "h-8 w-8"
          )}
          disabled={isLoading}
        >
          {isNarrating || isLoading ? (
            <>
              {isLoading ? 
                <Loader2 size={14} className="animate-spin" /> : 
                <VolumeX size={14} />
              }
              {showLabel && <span className="hidden sm:inline">Parar</span>}
            </>
          ) : (
            <>
              <Volume2 size={14} />
              {showLabel && <span className="hidden sm:inline">Narrar</span>}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" side="bottom">
        <div className="space-y-3">
          <h4 className="text-xs font-medium">Velocidade da narração</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs">0.5x</span>
            <Slider 
              value={[rate]} 
              min={0.5} 
              max={2.0} 
              step={0.1} 
              onValueChange={(vals) => setRate(vals[0])} 
              className="flex-1"
            />
            <span className="text-xs">2.0x</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleNarration} 
            className="w-full text-xs mt-1 gap-1" 
            disabled={isLoading}
          >
            {isNarrating ? (
              <>
                <VolumeX size={12} />
                Parar narração
              </>
            ) : (
              <>
                <Volume2 size={12} />
                Iniciar narração ({rate}x)
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
