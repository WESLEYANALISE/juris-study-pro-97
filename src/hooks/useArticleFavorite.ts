
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface UseArticleFavoriteProps {
  lawName: string;
  articleNumber: string;
}

export const useArticleFavorite = ({ lawName, articleNumber }: UseArticleFavoriteProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkIsFavorite = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('law_name', lawName)
        .eq('article_number', articleNumber)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar favorito:", error);
        toast.error("Erro ao verificar status de favorito");
        return;
      }
      
      setIsFavorite(!!data);
    } catch (err) {
      console.error("Exceção ao verificar favorito:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, lawName, articleNumber]);

  const toggleFavorite = async (articleText: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }

    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    checkIsFavorite,
    toggleFavorite,
    setIsFavorite
  };
};
