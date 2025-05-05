
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  fullHeight?: boolean;
}

export function FlashcardCard({ 
  flashcard, 
  onKnow, 
  onDontKnow,
  showControls = true,
  fullHeight = false
}: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const isMobile = useIsMobile();
  
  // Adjust height based on device and fullHeight prop
  const cardHeight = fullHeight 
    ? isMobile ? "70vh" : "80vh" 
    : isMobile ? "450px" : "500px";

  return (
    <div className={`relative perspective w-full mx-auto`} style={{ height: cardHeight }}>
      <motion.div 
        className={`absolute inset-0 transform-style-3d transition-transform duration-500 cursor-pointer ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setFlipped(!flipped)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Front of card (question) */}
        <Card className={`absolute inset-0 backface-hidden ${flipped ? 'invisible' : ''} border-2 hover:border-primary/20 overflow-hidden flex flex-col`}>
          <CardContent className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="text-sm">{flashcard.area}</Badge>
              {flashcard.dificuldade && (
                <Badge 
                  variant={
                    flashcard.dificuldade === 'fácil' ? 'secondary' : 
                    flashcard.dificuldade === 'médio' ? 'default' : 
                    'destructive'
                  }
                  className="text-sm"
                >
                  {flashcard.dificuldade}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">Tema: {flashcard.tema}</div>
            
            {flashcard.imagem_url && (
              <div className="mb-6 rounded-md overflow-hidden max-h-[30%]">
                <img 
                  src={flashcard.imagem_url} 
                  alt="Imagem da questão" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-grow flex items-center justify-center py-4">
              <h3 className="text-xl md:text-2xl font-semibold text-center">
                {flashcard.pergunta}
              </h3>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <div className="animate-pulse">Clique para ver a resposta</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Back of card (answer) */}
        <Card className={`absolute inset-0 backface-hidden rotate-y-180 ${!flipped ? 'invisible' : ''} border-2 hover:border-primary/20 overflow-hidden flex flex-col`}>
          <CardContent className="p-6 flex-grow flex flex-col">
            <div className="mb-2 text-sm text-muted-foreground">Resposta:</div>
            
            <div className="flex-grow overflow-auto scrollbar-thin">
              <div className="text-lg md:text-xl font-medium mb-6 mt-2">{flashcard.resposta}</div>
              
              {flashcard.explicacao && showExplanation && (
                <motion.div 
                  className="mt-6 bg-primary/5 p-4 rounded-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-sm font-medium mb-2">Explicação:</div>
                  <div className="text-sm text-muted-foreground">
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
                className="mt-4"
              >
                {showExplanation ? 'Ocultar explicação' : 'Mostrar explicação'}
              </Button>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <div className="animate-pulse">Clique para voltar à pergunta</div>
            </div>
          </CardContent>
          
          {showControls && (
            <CardFooter className="p-4 border-t gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-base" 
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
                className="flex-1 text-base" 
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
        </Card>
      </motion.div>
    </div>
  );
}
