
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface BookmarkButtonProps {
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  articleText: string;
  isLoading?: boolean;
}

export const BookmarkButton = ({
  isFavorite,
  setIsFavorite,
  lawName,
  articleNumber,
  articleText,
  isLoading = false
}: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }

    try {
      setIsProcessing(true);
      console.log(`Alternando favorito: ${isFavorite ? 'remover' : 'adicionar'}, lei: ${lawName}, artigo: ${articleNumber}`);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('vademecum_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('law_name', lawName)
          .eq('article_number', articleNumber);

        if (error) {
          console.error("Erro ao remover dos favoritos:", error);
          throw error;
        }

        toast.success('Artigo removido dos favoritos');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('vademecum_favorites')
          .insert({
            user_id: user.id,
            law_name: lawName,
            article_number: articleNumber,
            article_text: articleText,
            article_id: `${lawName}-${articleNumber}`
          });

        if (error) {
          console.error("Erro ao adicionar aos favoritos:", error);
          throw error;
        }

        toast.success('Artigo adicionado aos favoritos');
      }

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Exceção ao alternar favorito:", err);
      toast.error(`Erro ao ${isFavorite ? 'remover dos' : 'adicionar aos'} favoritos. Tente novamente.`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  const loading = isLoading || isProcessing;

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleFavorite}
        disabled={loading}
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFavorite ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
};
