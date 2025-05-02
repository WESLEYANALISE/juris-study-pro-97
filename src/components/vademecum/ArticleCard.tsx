import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, BookText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ArticleCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  articleUrl: string;
  favoriteArticleIds?: (string | number)[] | null;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id: articleId,
  title,
  description,
  category,
  articleUrl,
  favoriteArticleIds
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState<boolean>(favoriteArticleIds?.includes(articleId.toString()) || false);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Você precisa estar logado",
        description: "Faça login para adicionar artigos aos seus favoritos.",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_favorite_articles')
        .upsert(
          [
            {
              user_id: user.id,
              article_id: articleId,
            },
          ],
          { onConflict: 'user_id,article_id' }
        );

      if (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Erro ao adicionar/remover favorito",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: isFavorite
          ? "O artigo foi removido da sua lista de favoritos."
          : "O artigo foi adicionado à sua lista de favoritos.",
      });
    } catch (error) {
      console.error("Unexpected error toggling favorite:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar/remover o favorito. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Change the problematic line around line 75
  const isArticleFavorite = favoriteArticleIds?.includes(articleId.toString());

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="secondary">{category}</Badge>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="ghost" asChild>
          <Link to={articleUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
            Acessar Artigo
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" onClick={toggleFavorite}>
          {isArticleFavorite ? (
            <>
              Remover Favorito <Heart className="ml-2 h-4 w-4 fill-red-500 text-red-500" />
            </>
          ) : (
            <>
              Favoritar <Heart className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
