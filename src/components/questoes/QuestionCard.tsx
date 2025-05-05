import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Flag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionCardProps {
  question: any; // Replace 'any' with the actual type of your question object
  onFavorite?: (questionId: string, isFavorited: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onFavorite }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    checkIfFavorited();
    trackQuestionView();
  }, [question.id, user]);

  const checkIfFavorited = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await (supabase
        .from('questoes_favoritas' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('questao_id', question.id) as any);
        
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  };

  const trackQuestionView = async () => {
    if (!user) return;
    
    try {
      await (supabase
        .from('historico_questoes' as any)
        .insert({
          user_id: user.id,
          questao_id: question.id,
          visualizado_em: new Date().toISOString()
        }) as any);
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await (supabase
          .from('questoes_favoritas' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('questao_id', question.id) as any);
      } else {
        // Add to favorites
        await (supabase
          .from('questoes_favoritas' as any)
          .insert({
            user_id: user.id,
            questao_id: question.id,
            favoritado_em: new Date().toISOString()
          }) as any);
      }
      
      setIsFavorited(!isFavorited);
      return !isFavorited;
    } catch (error) {
      console.error('Erro ao favoritar questão:', error);
      return isFavorited;
    }
  };

  return (
    <Card className="w-full border">
      <CardHeader>
        <CardTitle>Questão</CardTitle>
        <CardDescription>
          {question.area} - {question.ano} - {question.banca}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md">
          <div className="mb-4">{question.questao}</div>
        </ScrollArea>
        
        {question.imagem_url && (
          <div className="flex justify-center my-4">
            <img
              src={question.imagem_url}
              alt="Questão"
              className="max-h-64 rounded-md border"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <strong>A)</strong> {question.alternativa_a}
          </div>
          <div>
            <strong>B)</strong> {question.alternativa_b}
          </div>
          <div>
            <strong>C)</strong> {question.alternativa_c}
          </div>
          <div>
            <strong>D)</strong> {question.alternativa_d}
          </div>
          {question.alternativa_e && (
            <div>
              <strong>E)</strong> {question.alternativa_e}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              setLoadingFavorite(true);
              const newFavoritedState = await toggleFavorite();
              setIsFavorited(newFavoritedState);
              setLoadingFavorite(false);
              
              if (onFavorite) {
                onFavorite(question.id, newFavoritedState);
              }
              
              toast({
                title: newFavoritedState ? "Questão favoritada" : "Questão removida dos favoritos",
                description: newFavoritedState ? "A questão foi adicionada aos seus favoritos." : "A questão foi removida dos seus favoritos.",
              });
            }}
            disabled={loadingFavorite}
          >
            {loadingFavorite ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFavorited ? (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Flag className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
