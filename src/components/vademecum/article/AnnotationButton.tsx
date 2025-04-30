
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface AnnotationButtonProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
}

export const AnnotationButton = ({
  lawName,
  articleNumber,
  articleText
}: AnnotationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [annotation, setAnnotation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAnnotation = async () => {
    if (!annotation.trim()) {
      toast.error('A anotação não pode estar vazia');
      return;
    }

    setIsSaving(true);
    
    try {
      // This is a placeholder for the actual save functionality
      // that will be implemented later with Supabase
      toast.success('Anotação salva com sucesso!');
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      toast.error('Erro ao salvar anotação');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground"
          onClick={() => setIsOpen(true)}
        >
          <PencilIcon size={16} />
          <span className="hidden sm:inline">Anotar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Anotação para Art. {articleNumber}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 mb-4 p-3 bg-muted/30 rounded-md">
          <p className="text-sm text-muted-foreground">
            {articleText.length > 150 
              ? articleText.substring(0, 150) + '...' 
              : articleText}
          </p>
        </div>
        
        <Textarea
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          placeholder="Escreva sua anotação aqui..."
          className="min-h-[150px] mb-4"
        />
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAnnotation}
            disabled={isSaving || !annotation.trim()}
          >
            Salvar Anotação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
