
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface AnnotationButtonProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
  showLabel?: boolean;
}

export const AnnotationButton = ({
  lawName,
  articleNumber,
  articleText,
  showLabel = false
}: AnnotationButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnnotation, setHasAnnotation] = useState(false);
  const { user } = useAuth();

  // Load existing annotation if available
  useEffect(() => {
    if (!user) return;
    
    const loadAnnotation = async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select('annotation_text')
        .eq('user_id', user.id)
        .eq('law_id', lawName)
        .eq('article_number', articleNumber)
        .single();
        
      if (data && !error) {
        setAnnotation(data.annotation_text);
        setHasAnnotation(true);
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - this is expected for new annotations
        console.error("Error loading annotation:", error);
      }
    };
    
    loadAnnotation();
  }, [user, lawName, articleNumber]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSaveAnnotation = async () => {
    if (!user) {
      toast.error("É necessário estar logado para salvar anotações");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (annotation.trim() === '') {
        // If annotation is empty, delete it
        await handleDeleteAnnotation();
        return;
      }
      
      const { error } = await supabase
        .from('annotations')
        .upsert({
          user_id: user.id,
          law_id: lawName,
          article_number: articleNumber,
          annotation_text: annotation,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setHasAnnotation(true);
      toast.success("Anotação salva com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error("Não foi possível salvar a anotação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAnnotation = async () => {
    if (!user || !hasAnnotation) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('user_id', user.id)
        .eq('law_id', lawName)
        .eq('article_number', articleNumber);
        
      if (error) throw error;
      
      setAnnotation('');
      setHasAnnotation(false);
      toast.success("Anotação removida com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting annotation:", error);
      toast.error("Não foi possível remover a anotação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost" 
        size="sm"
        onClick={handleOpenDialog}
        className={cn(
          "gap-1.5 text-xs font-normal text-primary/80 hover:text-primary hover:bg-primary/5",
          hasAnnotation && "bg-primary/10",
          showLabel ? "" : "h-8 w-8"
        )}
      >
        <PencilLine size={14} className={cn(hasAnnotation && "text-primary")} />
        {showLabel && (
          <span>{hasAnnotation ? "Editar anotação" : "Anotar"}</span>
        )}
      </Button>
      
      {/* Annotation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilLine size={16} className="text-primary" />
              Anotação - Art. {articleNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mb-4 mt-2">
            <div className="bg-muted/20 p-3 rounded-md mb-4 text-sm border border-muted/30">
              <strong>Trecho do artigo:</strong>
              <p className="mt-1 text-muted-foreground">{articleText.substring(0, 200)}{articleText.length > 200 ? '...' : ''}</p>
            </div>
            
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Sua anotação
            </label>
            <textarea
              className="w-full min-h-[200px] p-3 rounded-md border bg-background/80 focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Escreva suas observações sobre este artigo aqui..."
            />
          </div>
          
          <DialogFooter className="flex justify-between items-center gap-2 sm:gap-0">
            {hasAnnotation && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteAnnotation} 
                disabled={isSubmitting}
                size="sm"
                className="gap-1"
              >
                <Trash2 size={14} />
                Excluir
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCloseDialog} 
                disabled={isSubmitting}
                size="sm"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveAnnotation} 
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Salvando..." : "Salvar Anotação"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnotationButton;
