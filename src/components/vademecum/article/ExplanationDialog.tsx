
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  onNarration?: ((text: string) => Promise<void>) | null;
}

export function ExplanationDialog({
  isOpen,
  onClose,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  onNarration
}: ExplanationDialogProps) {
  // Format text to add proper markdown for better spacing
  const formatText = (text: string = ''): string => {
    if (!text) return '';
    
    // Convert sentences to paragraphs
    return text
      // Add paragraph breaks after each sentence
      .replace(/\.(\s+|$)/g, '.\n\n')
      // Remove extra newlines (consecutive empty lines)
      .replace(/\n{3,}/g, '\n\n')
      // Add emphasis to important terms
      .replace(/("[^"]+"|'[^']+')/g, '**$1**');
  };

  const formattedTechnical = formatText(technicalExplanation);
  const formattedFormal = formatText(formalExplanation);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Explicação do Artigo {articleNumber}</DialogTitle>
          <DialogDescription>
            Interpretação técnica e formal do artigo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={technicalExplanation ? "technical" : "formal"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="technical" 
              disabled={!technicalExplanation}
            >
              Técnica
            </TabsTrigger>
            <TabsTrigger 
              value="formal" 
              disabled={!formalExplanation}
            >
              Formal
            </TabsTrigger>
          </TabsList>
          
          {technicalExplanation && (
            <TabsContent value="technical" className="mt-4 space-y-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <ReactMarkdown className="prose dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-4">
                  {formattedTechnical}
                </ReactMarkdown>
              </div>
            </TabsContent>
          )}
          
          {formalExplanation && (
            <TabsContent value="formal" className="mt-4 space-y-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <ReactMarkdown className="prose dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-4">
                  {formattedFormal}
                </ReactMarkdown>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
