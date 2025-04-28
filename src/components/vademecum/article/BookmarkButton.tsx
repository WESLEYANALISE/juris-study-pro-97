
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface BookmarkButtonProps {
  user: User | null;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  articleText: string;
  articleId?: string; // Added optional article_id field
}

export const BookmarkButton = ({
  user,
  isFavorite,
  setIsFavorite,
  lawName,
  articleNumber,
  articleText,
  articleId = articleNumber // Default to article number if id not provided
}: BookmarkButtonProps) => {
  const handleBookmark = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar aos favoritos');
      return;
    }

    try {
      if (isFavorite) {
        // Delete from favorites
        const { error } = await supabase
          .from('vademecum_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('law_name', lawName)
          .eq('article_number', articleNumber);

        if (error) throw error;
        toast.success('Removido dos favoritos');
        setIsFavorite(false);
      } else {
        // Add to favorites - Include both article_id and required properties
        const { error } = await supabase
          .from('vademecum_favorites')
          .insert({
            user_id: user.id,
            law_name: lawName,
            article_id: articleId,
            article_number: articleNumber,
            article_text: articleText,
          });

        if (error) throw error;
        toast.success('Adicionado aos favoritos');
        setIsFavorite(true);
      }
    } catch (error: any) {
      toast.error('Erro ao adicionar/remover dos favoritos');
      console.error('Error handling bookmark:', error);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" size="icon" onClick={handleBookmark}>
        <Bookmark className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </Button>
    </motion.div>
  );
};
