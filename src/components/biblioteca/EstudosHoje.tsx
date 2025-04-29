
import { useState } from 'react';
import { useSpacedRepetition } from '@/hooks/use-spaced-repetition';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContentDetails {
  id: string;
  content_type: 'flashcard' | 'book_section' | 'legal_article';
  pergunta?: string;
  resposta?: string;
  nome?: string;
  titulo?: string;
  [key: string]: any;
}

export function EstudosHoje() {
  const { dueItems, updateStudyItem, isLoading } = useSpacedRepetition();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);

  // Buscar detalhes dos itens a serem estudados
  const { data: itemDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['estudo-detalhes', dueItems.map(i => i.id).join(',')],
    queryFn: async () => {
      if (!dueItems.length) return [];
      
      // Agrupar itens por tipo de conteúdo
      const byType = dueItems.reduce<Record<string, string[]>>((acc, item) => {
        if (!acc[item.content_type]) acc[item.content_type] = [];
        acc[item.content_type].push(item.content_id);
        return acc;
      }, {});
      
      // Buscar detalhes para cada tipo de conteúdo usando a RPC function
      const detailsPromises = Object.entries(byType).map(async ([type, ids]) => {
        try {
          const { data, error } = await supabase.functions.invoke('get_content_details', {
            body: { content_type: type, content_ids: ids }
          });
          
          if (error) {
            console.error(`Error fetching ${type} details:`, error);
            return [];
          }
          
          return (data || []).map((item: any) => ({
            ...item,
            content_type: type
          }));
        } catch (error) {
          console.error(`Error in content details fetch for ${type}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(detailsPromises);
      return results.flat() as ContentDetails[];
    },
    enabled: dueItems.length > 0
  });

  // Calcular progresso
  const progress = dueItems.length === 0 
    ? 100 
    : Math.round((currentItemIndex / dueItems.length) * 100);

  // Obter item atual
  const currentItem = dueItems[currentItemIndex];
  const currentDetails = currentItem && itemDetails
    ? itemDetails.find(i => 
        i.id === currentItem.content_id && 
        i.content_type === currentItem.content_type
      ) as ContentDetails
    : null;

  // Avaliar conhecimento do item atual
  const handleRateKnowledge = (level: number) => {
    if (!currentItem) return;
    
    updateStudyItem.mutate({
      itemId: currentItem.id,
      knowledgeLevel: level
    }, {
      onSuccess: () => {
        if (currentItemIndex < dueItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
          setShowingAnswer(false);
        }
      }
    });
  };

  if (isLoading || isLoadingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estudos de Hoje</CardTitle>
          <CardDescription>Carregando seus itens de estudo...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não houver itens para estudar hoje
  if (dueItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estudos de Hoje</CardTitle>
          <CardDescription>Você está em dia com seus estudos!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-muted-foreground">
              Você não tem itens para revisar hoje. Volte amanhã para continuar seus estudos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se todos os itens foram estudados
  if (currentItemIndex >= dueItems.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estudos de Hoje</CardTitle>
          <CardDescription>Parabéns! Você completou todas as revisões de hoje.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <p className="mb-4">Você revisou {dueItems.length} itens hoje!</p>
            <Button onClick={() => {
              setCurrentItemIndex(0);
              setShowingAnswer(false);
            }}>
              Recomeçar revisões
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar flashcard
  if (currentDetails?.content_type === 'flashcard') {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Estudos de Hoje</CardTitle>
              <CardDescription>
                {currentItemIndex + 1} de {dueItems.length} itens
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              <span>Flashcard</span>
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="min-h-[250px] flex flex-col">
            <div className="text-lg font-medium mb-4">
              {currentDetails.pergunta}
            </div>
            
            {showingAnswer ? (
              <div className="p-4 bg-muted/50 rounded-md mt-4 flex-1">
                <p className="text-md">{currentDetails.resposta}</p>
              </div>
            ) : (
              <Button 
                onClick={() => setShowingAnswer(true)} 
                variant="outline"
                className="mt-4"
              >
                Mostrar resposta
              </Button>
            )}
          </div>
        </CardContent>
        
        {showingAnswer && (
          <CardFooter className="flex-col gap-4">
            <p className="text-sm text-muted-foreground w-full mb-2">
              Como você avalia seu conhecimento sobre este item?
            </p>
            <div className="flex gap-2 justify-between w-full">
              <Button 
                variant="destructive" 
                onClick={() => handleRateKnowledge(1)}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" /> Não sei
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleRateKnowledge(3)}
                className="flex-1"
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Difícil
              </Button>
              <Button 
                variant="success" 
                onClick={() => handleRateKnowledge(5)}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Fácil
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Fallback para outros tipos de conteúdo
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estudos de Hoje</CardTitle>
        <CardDescription>
          {currentItemIndex + 1} de {dueItems.length} itens
        </CardDescription>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 text-center">
          <BookOpen className="h-8 w-8 text-primary mr-2" />
          <div>
            <p className="text-lg font-medium">
              {currentDetails?.nome || currentDetails?.titulo || "Item de estudo"}
            </p>
            <p className="text-sm text-muted-foreground">
              Você precisa revisar este conteúdo hoje
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            if (currentItemIndex > 0) {
              setCurrentItemIndex(prev => prev - 1);
              setShowingAnswer(false);
            }
          }}
          disabled={currentItemIndex === 0}
        >
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleRateKnowledge(2)}
          >
            Revisar mais tarde
          </Button>
          <Button 
            variant="default"
            onClick={() => handleRateKnowledge(4)}
          >
            Marcar como revisado
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
