
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Flag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface QuestionCardProps {
  question: any; // Replace 'any' with the actual type of your question object
  onFavorite?: (questionId: string, isFavorited: boolean) => void;
  // Added properties for the newer version of QuestionCard used in Questoes.tsx
  id?: number;
  area?: string;
  tema?: string;
  pergunta?: string;
  respostas?: { A: string; B: string; C: string; D: string; };
  respostaCorreta?: string;
  comentario?: string;
  percentualAcertos?: string;
  onAnswer?: (questionId: number, answer: string, correct: boolean) => void;
  onNext?: () => void;
}

// Make sure we're exporting the component with the correct name
export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onFavorite, ...props }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    if (question) {
      checkIfFavorited().then(setIsFavorited);
      trackQuestionView();
    }
  }, [question?.id, user]);

  const checkIfFavorited = async () => {
    if (!user || !question) return false;
    
    try {
      const { data, error } = await supabase
        .from('questoes_favoritas')
        .select('*')
        .eq('user_id', user.id)
        .eq('questao_id', question.id);
        
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  };

  const trackQuestionView = async () => {
    if (!user || !question) return;
    
    try {
      await supabase
        .from('historico_questoes')
        .insert({
          user_id: user.id,
          questao_id: question.id,
          visualizado_em: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !question) return;
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('questoes_favoritas')
          .delete()
          .eq('user_id', user.id)
          .eq('questao_id', question.id);
      } else {
        // Add to favorites
        await supabase
          .from('questoes_favoritas')
          .insert({
            user_id: user.id,
            questao_id: question.id,
            favoritado_em: new Date().toISOString()
          });
      }
      
      setIsFavorited(!isFavorited);
      return !isFavorited;
    } catch (error) {
      console.error('Erro ao favoritar questão:', error);
      return isFavorited;
    }
  };

  // Handle the newer version of QuestionCard used in Questoes.tsx
  if (props.id) {
    // This is an implementation that matches how it's used in Questoes.tsx
    // Implementation details would go here
    return <Card>
      {/* Implementation for the newer QuestionCard version */}
      <CardHeader>
        <CardTitle>Questão</CardTitle>
        <CardDescription>{props.area} - {props.tema}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-base">{props.pergunta}</div>
          
          <div className="space-y-2 mt-4">
            {props.respostas && Object.entries(props.respostas).map(([key, value]) => (
              <Button 
                key={key}
                variant="outline" 
                className="w-full justify-start text-left"
                onClick={() => props.onAnswer && props.onAnswer(props.id!, key, key === props.respostaCorreta)}
              >
                <span className="font-bold mr-2">{key})</span> {value}
              </Button>
            ))}
          </div>
          
          {props.comentario && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Explicação:</h4>
              <p>{props.comentario}</p>
            </div>
          )}
          
          {props.percentualAcertos && (
            <div className="mt-2 text-sm text-muted-foreground">
              Taxa de acertos: {props.percentualAcertos}%
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {props.onNext && (
          <Button onClick={props.onNext}>
            Próxima Questão
          </Button>
        )}
      </CardFooter>
    </Card>;
  }

  // Original QuestionCard implementation
  return (
    <Card className="w-full border">
      <CardHeader>
        <CardTitle>Questão</CardTitle>
        <CardDescription>
          {question?.area} - {question?.ano} - {question?.banca}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md">
          <div className="mb-4">{question?.questao}</div>
        </ScrollArea>
        
        {question?.imagem_url && (
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
            <strong>A)</strong> {question?.alternativa_a}
          </div>
          <div>
            <strong>B)</strong> {question?.alternativa_b}
          </div>
          <div>
            <strong>C)</strong> {question?.alternativa_c}
          </div>
          <div>
            <strong>D)</strong> {question?.alternativa_d}
          </div>
          {question?.alternativa_e && (
            <div>
              <strong>E)</strong> {question?.alternativa_e}
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

// Make sure we also have this default export to maintain compatibility
export default QuestionCard;
