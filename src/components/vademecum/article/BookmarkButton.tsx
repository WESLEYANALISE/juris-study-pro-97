
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookmarkCheck, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface BookmarkButtonProps {
  user: User | null;
  isFavorite: boolean;
  setIsFavorite: (favorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  articleText: string;
}

export const BookmarkButton = ({ 
  user, 
  isFavorite, 
  setIsFavorite,
  lawName,
  articleNumber,
  articleText 
}: BookmarkButtonProps) => {
  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }
    
    try {
      if (isFavorite) {
        await supabase
          .from('vademecum_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('law_name', lawName)
          .eq('article_number', articleNumber);
      } else {
        await supabase
          .from('vademecum_favorites')
          .insert({
            user_id: user.id,
            law_name: lawName,
            article_id: articleNumber,
            article_number: articleNumber,
            article_text: articleText
          });
      }
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Artigo removido dos favoritos' : 'Artigo adicionado aos favoritos');
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" size="icon" onClick={toggleFavorite}>
        {isFavorite ? <BookmarkCheck className="text-primary h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
};
