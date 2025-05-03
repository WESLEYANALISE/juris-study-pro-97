
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArticleCardProps {
  id: string;
  lawId: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  fontSize?: number;
}

export function ArticleCard({
  id,
  lawId,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  fontSize = 16
}: ArticleCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = React.useState(false);

  // Check if article is favorited
  React.useEffect(() => {
    if (!user) return;

    const checkIfFavorited = async () => {
      const { data } = await supabase
        .from('vademecum_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .single();
        
      setIsFavorited(!!data);
    };
    
    checkIfFavorited();
  }, [user, id]);

  const handleArticleClick = () => {
    navigate(`/vademecum/${lawId}/${id}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar artigos.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('vademecum_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', id);
          
        setIsFavorited(false);
        toast({
          title: "Removido dos favoritos",
          description: "O artigo foi removido dos seus favoritos."
        });
      } else {
        await supabase
          .from('vademecum_favorites')
          .insert({
            user_id: user.id,
            article_id: id,
            law_name: lawId,
            article_number: articleNumber,
            article_text: articleText
          });
          
        setIsFavorited(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "O artigo foi adicionado aos seus favoritos."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os favoritos.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card 
      className="mb-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary" 
      onClick={handleArticleClick}
    >
      <CardContent className="p-4 relative">
        <div className="flex justify-between items-start">
          <h3 
            className="text-lg font-semibold mb-2" 
            style={{ fontSize: `${fontSize}px` }}
          >
            Art. {articleNumber}
          </h3>
          <Button 
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={toggleFavorite}
          >
            {isFavorited ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
        <p 
          className="text-gray-700 dark:text-gray-300" 
          style={{ fontSize: `${fontSize}px` }}
        >
          {articleText}
        </p>
      </CardContent>
    </Card>
  );
}
