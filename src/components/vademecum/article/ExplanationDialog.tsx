
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  onNarration: (text: string) => Promise<void>;
}

export const ExplanationDialog = ({
  isOpen,
  onClose,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  onNarration
}: ExplanationDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    technicalExplanation ? 'technical' : formalExplanation ? 'formal' : 'technical'
  );

  const handleCopy = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para a área de transferência');
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Não foi possível copiar o texto');
    }
  };

  const getCurrentExplanation = () => {
    return activeTab === 'technical' ? technicalExplanation : formalExplanation;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Explicação do Artigo {articleNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {(technicalExplanation || formalExplanation) ? (
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger 
                  value="technical" 
                  disabled={!technicalExplanation}
                  className={cn(!technicalExplanation && "opacity-50 cursor-not-allowed")}
                >
                  Explicação Técnica
                </TabsTrigger>
                <TabsTrigger 
                  value="formal" 
                  disabled={!formalExplanation}
                  className={cn(!formalExplanation && "opacity-50 cursor-not-allowed")}
                >
                  Explicação Formal
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="technical" className="pt-2">
                {technicalExplanation ? (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <h4 className="font-medium">Explicação Técnica</h4>
                      <div className="space-x-2">
                        <Button 
                          variant="purple" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => onNarration(technicalExplanation)}
                          title="Narrar explicação técnica"
                        >
                          <Volume2 size={14} />
                          Narrar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleCopy(technicalExplanation)}
                          title="Copiar explicação técnica"
                        >
                          <Copy size={14} />
                          Copiar
                        </Button>
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                      <ReactMarkdown>{technicalExplanation}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma explicação técnica disponível para este artigo.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="formal" className="pt-2">
                {formalExplanation ? (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <h4 className="font-medium">Explicação Formal</h4>
                      <div className="space-x-2">
                        <Button 
                          variant="purple" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => onNarration(formalExplanation)}
                          title="Narrar explicação formal"
                        >
                          <Volume2 size={14} />
                          Narrar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleCopy(formalExplanation)}
                          title="Copiar explicação formal"
                        >
                          <Copy size={14} />
                          Copiar
                        </Button>
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                      <ReactMarkdown>{formalExplanation}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma explicação formal disponível para este artigo.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma explicação disponível para este artigo.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExplanationDialog;
