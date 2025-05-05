
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
}

// Helper function to format text with proper paragraph breaks
const formatText = (text?: string) => {
  if (!text) return null;
  
  // Split text by double line breaks or single line breaks
  const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim().length > 0);
  
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4">{paragraph}</p>
      ))}
    </>
  );
};

export const ExplanationDialog = ({
  isOpen,
  onClose,
  articleNumber,
  technicalExplanation,
  formalExplanation,
}: ExplanationDialogProps) => {
  const hasTechnical = !!technicalExplanation;
  const hasFormal = !!formalExplanation;
  
  // Default tab - use whichever explanation is available
  const defaultTab = hasTechnical ? "technical" : hasFormal ? "formal" : "";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Explicação do Artigo {articleNumber}
          </DialogTitle>
          <DialogDescription>
            Entenda os conceitos jurídicos deste artigo.
          </DialogDescription>
        </DialogHeader>
        
        {(hasTechnical || hasFormal) ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="technical" 
                disabled={!hasTechnical}
                className={cn(!hasTechnical && "opacity-50 cursor-not-allowed")}
              >
                Técnica
              </TabsTrigger>
              <TabsTrigger 
                value="formal" 
                disabled={!hasFormal}
                className={cn(!hasFormal && "opacity-50 cursor-not-allowed")}
              >
                Formal
              </TabsTrigger>
            </TabsList>
            
            {hasTechnical && (
              <TabsContent value="technical" className="mt-4 text-muted-foreground">
                <div className="rounded-lg bg-muted/50 p-4">
                  {formatText(technicalExplanation)}
                </div>
              </TabsContent>
            )}
            
            {hasFormal && (
              <TabsContent value="formal" className="mt-4 text-muted-foreground">
                <div className="rounded-lg bg-muted/50 p-4">
                  {formatText(formalExplanation)}
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Nenhuma explicação disponível para este artigo.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
