
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Flag, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { safeSelect, safeInsert, safeDelete } from "@/utils/supabase-helpers";
import { SupabaseFavorite, SupabaseHistoryEntry } from "@/types/supabase";

export interface QuestionCardProps {
  question?: any; // Question object from the original implementation
  onFavorite?: (questionId: string, isFavorited: boolean) => void;
  // Properties for the newer version
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (question) {
      checkIfFavorited().then(setIsFavorited);
      trackQuestionView();
    }
  }, [question?.id, user]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowExplanation(false);
  }, [props.id, question?.id]);

  const checkIfFavorited = async () => {
    if (!user || !question) return false;
    
    try {
      const { data, error } = await safeSelect<SupabaseFavorite>(
        'questoes_favoritas', 
        '*', 
        query => query.eq('user_id', user.id).eq('questao_id', question.id)
      );
        
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
      await safeInsert<SupabaseHistoryEntry>(
        'historico_questoes',
        {
          user_id: user.id,
          questao_id: question.id,
          visualizado_em: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !question) return false;
    
    try {
      setLoadingFavorite(true);
      
      if (isFavorited) {
        // Remove from favorites
        await safeDelete<SupabaseFavorite>(
          'questoes_favoritas',
          query => query.eq('user_id', user.id).eq('questao_id', question.id)
        );
        return false;
      } else {
        // Add to favorites
        await safeInsert<SupabaseFavorite>(
          'questoes_favoritas',
          {
            user_id: user.id,
            questao_id: question.id,
            favoritado_em: new Date().toISOString()
          }
        );
        return true;
      }
    } catch (error) {
      console.error('Erro ao favoritar questão:', error);
      return isFavorited; // Return current state if there was an error
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleAnswerSelection = (key: string) => {
    if (selectedAnswer) return; // Prevent multiple answers
    
    setSelectedAnswer(key);
    const correct = key === props.respostaCorreta;
    setIsAnswerCorrect(correct);
    setShowExplanation(true);
    
    if (props.onAnswer && props.id) {
      props.onAnswer(props.id, key, correct);
    }
  };

  // Handle the newer version of QuestionCard used in Questoes.tsx
  if (props.id) {
    return (
      <Card className="w-full border shadow-md hover:shadow-lg transition-all duration-300 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs bg-primary/10 hover:bg-primary/20">
              {props.area}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {props.tema}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2">Questão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-base leading-relaxed">{props.pergunta}</div>
            
            <div className="space-y-3 mt-6">
              {props.respostas && Object.entries(props.respostas).map(([key, value]) => {
                const isSelected = selectedAnswer === key;
                const isCorrect = props.respostaCorreta === key;
                let buttonClassName = "w-full justify-start text-left py-3 hover:bg-primary/10 hover:border-primary/40 transition-colors";
                
                // Add styling based on selection and correctness
                if (isSelected) {
                  buttonClassName += isCorrect 
                    ? " bg-green-500/20 border-green-500" 
                    : " bg-red-500/20 border-red-500";
                } else if (selectedAnswer && isCorrect) {
                  // Highlight correct answer when user selected wrong
                  buttonClassName += " bg-green-500/20 border-green-500";
                }
                
                return (
                  <Button 
                    key={key}
                    variant="outline" 
                    className={buttonClassName}
                    onClick={() => handleAnswerSelection(key)}
                    disabled={!!selectedAnswer}
                  >
                    <span className="font-bold mr-2">{key})</span> {value}
                    {isSelected && (
                      isCorrect 
                        ? <CheckCircle className="ml-auto h-5 w-5 text-green-500" /> 
                        : <XCircle className="ml-auto h-5 w-5 text-red-500" />
                    )}
                    {!isSelected && selectedAnswer && isCorrect && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                    )}
                  </Button>
                );
              })}
            </div>
            
            {showExplanation && props.comentario && (
              <div className="mt-6 p-4 bg-muted/40 rounded-md border border-muted">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Explicação:
                </h4>
                <p className="text-sm">{props.comentario}</p>
              </div>
            )}
            
            {props.percentualAcertos && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                <span>Taxa de acertos:</span>
                <Badge variant="outline" className="text-xs">
                  {props.percentualAcertos}%
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="h-4 w-4 mr-1" />
            Favoritar
          </Button>
          {selectedAnswer && props.onNext && (
            <Button onClick={props.onNext} variant="default" size="sm" className="gap-1">
              Próxima Questão
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Original QuestionCard implementation with improved design
  return (
    <Card className="w-full border shadow-md hover:shadow-lg transition-all duration-300 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Questão</CardTitle>
          <div className="flex gap-1">
            {question?.ano && (
              <Badge variant="outline" className="text-xs">
                {question.ano}
              </Badge>
            )}
            {question?.banca && (
              <Badge variant="outline" className="text-xs">
                {question.banca}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex gap-2 items-center">
          {question?.area && (
            <Badge variant="secondary" className="text-xs bg-primary/10">
              {question.area}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border border-border/50 bg-muted/5 p-4">
          <div className="mb-4 leading-relaxed">{question?.questao}</div>
        </ScrollArea>
        
        {question?.imagem_url && (
          <div className="flex justify-center my-4">
            <img
              src={question.imagem_url}
              alt="Questão"
              className="max-h-64 rounded-md border hover:shadow-md transition-all"
            />
          </div>
        )}
        
        <div className="space-y-3 mt-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-left py-3 hover:bg-primary/10"
          >
            <span className="font-bold mr-2">A)</span> {question?.alternativa_a}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left py-3 hover:bg-primary/10"
          >
            <span className="font-bold mr-2">B)</span> {question?.alternativa_b}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left py-3 hover:bg-primary/10"
          >
            <span className="font-bold mr-2">C)</span> {question?.alternativa_c}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left py-3 hover:bg-primary/10"
          >
            <span className="font-bold mr-2">D)</span> {question?.alternativa_d}
          </Button>
          {question?.alternativa_e && (
            <Button 
              variant="outline" 
              className="w-full justify-start text-left py-3 hover:bg-primary/10"
            >
              <span className="font-bold mr-2">E)</span> {question?.alternativa_e}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
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
            className="hover:bg-primary/10"
          >
            {loadingFavorite ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFavorited ? (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10">
          <Flag className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
