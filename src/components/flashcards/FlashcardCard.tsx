
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Flashcard = {
  id: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
  area: string;
  tema: string;
  tags: string[] | null;
  dificuldade: string | null;
  imagem_url: string | null;
};

interface FlashcardCardProps {
  flashcard: Flashcard;
  onKnow?: () => void;
  onDontKnow?: () => void;
  showControls?: boolean;
}

export function FlashcardCard({ 
  flashcard, 
  onKnow, 
  onDontKnow,
  showControls = true
}: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="relative perspective w-full h-[400px] max-w-md mx-auto">
      <Card 
        className={`absolute inset-0 transform-style-3d transition-transform duration-500 cursor-pointer ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front of card (question) */}
        <div className={`absolute inset-0 backface-hidden ${flipped ? 'invisible' : ''}`}>
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline">{flashcard.area}</Badge>
              {flashcard.dificuldade && (
                <Badge 
                  variant={
                    flashcard.dificuldade === 'fácil' ? 'secondary' : 
                    flashcard.dificuldade === 'médio' ? 'default' : 
                    'destructive'
                  }
                >
                  {flashcard.dificuldade}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">Tema: {flashcard.tema}</div>
            
            {flashcard.imagem_url && (
              <div className="mb-4 rounded overflow-hidden max-h-[150px]">
                <img 
                  src={flashcard.imagem_url} 
                  alt="Imagem da questão" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-grow flex items-center justify-center">
              <h3 className="text-xl font-semibold text-center">
                {flashcard.pergunta}
              </h3>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Clique para ver a resposta
            </div>
          </CardContent>
        </div>
        
        {/* Back of card (answer) */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 ${!flipped ? 'invisible' : ''}`}>
          <CardContent className="p-6 h-full flex flex-col">
            <div className="mb-2 text-sm text-muted-foreground">Resposta:</div>
            
            <div className="flex-grow overflow-auto">
              <div className="text-lg font-medium mb-4">{flashcard.resposta}</div>
              
              {flashcard.explicacao && showExplanation && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Explicação:</div>
                  <div className="text-sm text-muted-foreground">
                    {flashcard.explicacao}
                  </div>
                </div>
              )}
            </div>
            
            {flashcard.explicacao && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExplanation(!showExplanation);
                }}
                className="mt-2"
              >
                {showExplanation ? 'Ocultar explicação' : 'Mostrar explicação'}
              </Button>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-2">
              Clique para voltar à pergunta
            </div>
          </CardContent>
          
          {showControls && (
            <CardFooter className="p-4 border-t gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDontKnow) onDontKnow();
                  setFlipped(false);
                }}
              >
                Não sei
              </Button>
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onKnow) onKnow();
                  setFlipped(false);
                }}
              >
                Sei
              </Button>
            </CardFooter>
          )}
        </div>
      </Card>
    </div>
  );
}
