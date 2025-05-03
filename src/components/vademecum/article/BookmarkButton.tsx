
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useVadeMecumFavorites } from '@/hooks/useVadeMecumFavorites';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface BookmarkButtonProps {
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  lawName: string;
  articleNumber: string;
  articleText: string;
  isLoading?: boolean;
  showLabel?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isFavorite,
  setIsFavorite,
  lawName,
  articleNumber,
  articleText,
  isLoading = false,
  showLabel = false
}) => {
  const { toggleFavorite } = useVadeMecumFavorites();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar artigos.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await toggleFavorite({
        law_name: lawName,
        article_id: articleNumber,
        article_number: articleNumber,
        article_text: articleText
      });
      
      setIsFavorite(!isFavorite);
      
      toast({
        title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: isFavorite 
          ? "O artigo foi removido dos seus favoritos." 
          : "O artigo foi adicionado aos seus favoritos."
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os favoritos.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? "default" : "ghost"}
      size={showLabel ? "sm" : "icon"}
      className={showLabel ? "gap-2" : "h-8 w-8"}
      onClick={handleToggleFavorite}
      disabled={isLoading || isProcessing}
    >
      {isProcessing || isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        isFavorite ? (
          <BookmarkCheck size={16} className="text-primary" />
        ) : (
          <Bookmark size={16} />
        )
      )}
      {showLabel && <span className="hidden sm:inline">{isFavorite ? "Salvo" : "Salvar"}</span>}
    </Button>
  );
};

export default BookmarkButton;
