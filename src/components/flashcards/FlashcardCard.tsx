
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
        className={`absolute inset-0 transform-style-3d transition-transform duration-500 cursor-pointer gradient-card ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front of card (question) */}
        <div className={`absolute inset-0 backface-hidden ${flipped ? 'invisible' : ''}`}>
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="bg-primary/10 border-primary/20">{flashcard.area}</Badge>
              {flashcard.dificuldade && (
                <Badge 
                  variant={
                    flashcard.dificuldade === 'fácil' ? 'secondary' : 
                    flashcard.dificuldade === 'médio' ? 'default' : 
                    'destructive'
                  }
                  className="shadow-sm"
                >
                  {flashcard.dificuldade}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">Tema: {flashcard.tema}</div>
            
            {flashcard.imagem_url && (
              <div className="mb-4 rounded-lg overflow-hidden max-h-[150px] border border-primary/10">
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
            <div className="mb-2 text-sm font-medium text-primary">Resposta:</div>
            
            <div className="flex-grow overflow-auto">
              <div className="text-lg font-medium mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                {flashcard.resposta}
              </div>
              
              {flashcard.explicacao && showExplanation && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <div className="text-sm font-medium mb-1 text-primary">Explicação:</div>
                  <div className="text-sm text-muted-foreground p-3 bg-background/40 rounded-lg border-l-2 border-primary/30">
                    {flashcard.explicacao}
                  </div>
                </motion.div>
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
                className="mt-2 hover:bg-primary/10"
              >
                {showExplanation ? 'Ocultar explicação' : 'Mostrar explicação'}
              </Button>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-2">
              Clique para voltar à pergunta
            </div>
          </CardContent>
          
          {showControls && (
            <CardFooter className="p-4 border-t border-primary/10 gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-colors" 
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
                className="flex-1 gradient-purple" 
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
