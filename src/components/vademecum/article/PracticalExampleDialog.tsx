
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PracticalExampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  example?: string;
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

export const PracticalExampleDialog = ({
  isOpen,
  onClose,
  articleNumber,
  example,
}: PracticalExampleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Exemplo Prático — Artigo {articleNumber}
          </DialogTitle>
          <DialogDescription>
            Como este artigo se aplica na prática.
          </DialogDescription>
        </DialogHeader>
        
        {example ? (
          <div className="mt-4 text-muted-foreground">
            <div className="rounded-lg bg-muted/50 p-4">
              {formatText(example)}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Nenhum exemplo prático disponível para este artigo.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
