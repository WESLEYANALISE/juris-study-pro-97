
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Copy, ExternalLink } from "lucide-react";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TermoCardProps {
  termo: {
    id: string;
    termo: string;
    definicao: string;
    exemplo_uso: string | null;
    area_direito: string | null;
  };
  className?: string;
  onView?: (termoId: string) => void;
}

export const TermoCard: React.FC<TermoCardProps> = ({ termo, className, onView }) => {
  // Call onView when component is mounted
  React.useEffect(() => {
    if (onView) {
      onView(termo.id);
    }
  }, [termo.id, onView]);

  const handleTextToSpeech = (text: string) => {
    TextToSpeechService.speak(text);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Texto copiado!",
      description: "O texto foi copiado para a área de transferência."
    });
  };

  const areas = termo.area_direito?.split(',').map(area => area.trim()) || [];

  return (
    <Card 
      className={cn(
        "border-2 hover:border-primary/20 transition-all duration-300 overflow-hidden", 
        className
      )}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold">{termo.termo}</h3>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleTextToSpeech(termo.definicao)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleCopyText(termo.definicao)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-base mb-4">{termo.definicao}</p>
        
        {termo.exemplo_uso && (
          <div className="bg-muted p-3 rounded-md mb-4">
            <strong className="text-sm text-muted-foreground">Exemplo de uso:</strong> 
            <p className="italic text-sm mt-1">{termo.exemplo_uso}</p>
          </div>
        )}

        {areas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-border">
            {areas.map((area, index) => (
              <span 
                key={index} 
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
