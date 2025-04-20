
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Lightbulb, MessageSquare } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface FlashcardCardProps {
  flashcard: Tables<"flash_cards">;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashcardCard = ({ flashcard, isFlipped, onFlip }: FlashcardCardProps) => {
  return (
    <motion.div 
      className="perspective-1000 mb-6"
      initial={false}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <Card 
        className="min-h-[300px] md:min-h-[400px] cursor-pointer transform-gpu"
        onClick={onFlip}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <CardHeader className="text-center pt-8">
                <h3 className="text-xl font-semibold mb-0">Pergunta</h3>
                <Separator className="my-3" />
              </CardHeader>
              <CardContent className="text-center px-8">
                <p className="text-lg">{flashcard.pergunta || "Sem pergunta"}</p>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <CardHeader className="text-center pt-8">
                <h3 className="text-xl font-semibold mb-0">Resposta</h3>
                <Separator className="my-3" />
              </CardHeader>
              <CardContent className="text-center px-8">
                <p className="text-lg">{flashcard.resposta || "Sem resposta"}</p>
              </CardContent>
              {flashcard.explicacao && (
                <CardFooter className="flex justify-center pb-4">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Ver Explicação
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-lg">
                        <DrawerHeader>
                          <DrawerTitle>Explicação Detalhada</DrawerTitle>
                          <DrawerDescription>
                            Aprofunde seu conhecimento com esta explicação adicional.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                          <div className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Sobre este conceito:
                              </h4>
                              <p>{flashcard.explicacao}</p>
                            </div>
                          </div>
                        </div>
                        <DrawerFooter>
                          <Button variant="outline" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))}>
                            Fechar
                          </Button>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </CardFooter>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
