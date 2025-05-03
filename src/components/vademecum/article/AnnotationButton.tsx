
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine } from 'lucide-react';
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
  const { user } = useAuth();

  // Load existing annotation if available
  React.useEffect(() => {
    if (!user || !isDialogOpen) return;
    
    const loadAnnotation = async () => {
      const { data, error } = await supabase
        .from('user_annotations')
        .select('annotation_text')
        .eq('user_id', user.id)
        .eq('law_name', lawName)
        .eq('article_number', articleNumber)
        .single();
        
      if (data && !error) {
        setAnnotation(data.annotation_text);
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - this is expected for new annotations
        console.error("Error loading annotation:", error);
      }
    };
    
    loadAnnotation();
  }, [user, lawName, articleNumber, isDialogOpen]);

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
      const { error } = await supabase
        .from('user_annotations')
        .upsert({
          user_id: user.id,
          law_name: lawName,
          article_number: articleNumber,
          article_text: articleText.slice(0, 200) + (articleText.length > 200 ? '...' : ''),
          annotation_text: annotation,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success("Anotação salva com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error("Não foi possível salvar a anotação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size={showLabel ? "sm" : "icon"}
          onClick={handleOpenDialog}
          className={`gap-2 bg-primary/5 hover:bg-primary/10 text-primary-foreground ${showLabel ? "" : "h-8 w-8"}`}
        >
          <PencilLine className="h-4 w-4" />
          {showLabel && <span>Anotar</span>}
        </Button>
      </motion.div>
      
      {/* Annotation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Anotação - Art. {articleNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="mb-4 mt-2">
            <div className="bg-muted p-3 rounded-md mb-4 text-sm">
              <strong>Trecho do artigo:</strong>
              <p className="mt-1">{articleText.substring(0, 200)}{articleText.length > 200 ? '...' : ''}</p>
            </div>
            
            <label className="block text-sm font-medium mb-2">
              Sua anotação
            </label>
            <textarea
              className="w-full min-h-[200px] p-3 rounded-md border bg-background"
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Escreva suas observações sobre este artigo aqui..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAnnotation} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Anotação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnotationButton;
