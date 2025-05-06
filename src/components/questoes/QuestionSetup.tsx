
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { TrendingThemes } from "./TrendingThemes";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuestionSetupProps {
  onStart: (config: {
    area: string;
    temas: string[];
    quantidade: number;
  }) => void;
}

export const QuestionSetup = ({ onStart }: QuestionSetupProps) => {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState<number>(10);
  const [availableQuantities, setAvailableQuantities] = useState<number[]>([5, 10, 15, 20, 25, 30]);
  const isMobile = useIsMobile();

  const { data: areas, isLoading: loadingAreas } = useQuery({
    queryKey: ["question-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questoes")
        .select("Area")
        .not("Area", "is", null)
        .order("Area");

      if (error) throw error;
      return [...new Set(data.map((item) => item.Area))];
    }
  });

  const { data: temas, isLoading: loadingTemas } = useQuery({
    queryKey: ["question-temas", selectedArea],
    enabled: !!selectedArea,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questoes")
        .select("Tema")
        .eq("Area", selectedArea)
        .not("Tema", "is", null)
        .order("Tema");

      if (error) throw error;
      return [...new Set(data.map((item) => item.Tema))];
    }
  });

  const { data: questionCount, isLoading: loadingCount } = useQuery({
    queryKey: ["question-count", selectedArea, selectedTemas],
    enabled: !!selectedArea && selectedTemas.length > 0,
    queryFn: async () => {
      let query = supabase
        .from("questoes")
        .select("id", { count: 'exact' })
        .eq("Area", selectedArea);

      if (selectedTemas.length > 0) {
        query = query.in("Tema", selectedTemas);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0; // Ensure we always return at least 0
    }
  });

  // Update available quantities based on question count
  useEffect(() => {
    if (questionCount !== null && questionCount !== undefined) {
      const maxQuestions = questionCount as number;
      const newAvailableQuantities = [5, 10, 15, 20, 25, 30].filter(num => num <= maxQuestions);
      
      if (newAvailableQuantities.length === 0 && maxQuestions > 0) {
        // If no standard values fit, just use the max available
        newAvailableQuantities.push(maxQuestions);
      }
      
      setAvailableQuantities(newAvailableQuantities);
      
      // Adjust selected quantity if it's more than available
      if (quantidade > maxQuestions) {
        setQuantidade(Math.max(...newAvailableQuantities, 0));
      }
    }
  }, [questionCount, quantidade]);

  const handleTemaToggle = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const handleStart = () => {
    if (!selectedArea) {
      toast.error("Selecione uma área do direito");
      return;
    }
    
    if (selectedTemas.length === 0) {
      toast.error("Selecione pelo menos um tema");
      return;
    }
    
    if (questionCount === 0) {
      toast.error("Não há questões disponíveis para esta seleção");
      return;
    }
    
    onStart({
      area: selectedArea,
      temas: selectedTemas,
      quantidade: quantidade > (questionCount || 0) ? (questionCount || 5) : quantidade,
    });
    
    toast.success(`Sessão iniciada com ${quantidade} questões`);
  };

  if (loadingAreas) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <Card className="max-w-2xl border shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl">Configurar Questões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Área do Direito</label>
            <Select value={selectedArea} onValueChange={(value) => {
              setSelectedArea(value);
              setSelectedTemas([]);
            }}>
              <SelectTrigger className="bg-card border-primary/20">
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between items-center">
              <span>Temas</span>
              {selectedTemas.length > 0 && (
                <Badge variant="outline" className="font-normal">
                  {selectedTemas.length} selecionados
                </Badge>
              )}
            </label>
            <div className="grid gap-2 max-h-48 overflow-auto p-2 border rounded-lg border-primary/20 bg-background/50">
              {loadingTemas ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
              ) : temas && temas.length > 0 ? (
                temas.map((tema) => (
                  <label key={tema} className="flex items-center space-x-2 hover:bg-primary/5 p-1.5 rounded-md transition-colors">
                    <Checkbox 
                      checked={selectedTemas.includes(tema)}
                      onCheckedChange={() => handleTemaToggle(tema)}
                      className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm">{tema}</span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-2">
                  {selectedArea ? "Nenhum tema disponível" : "Selecione uma área primeiro"}
                </div>
              )}
            </div>
          </div>

          {loadingCount ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Calculando questões disponíveis...</span>
            </div>
          ) : questionCount !== null ? (
            <div className="text-sm bg-muted/30 rounded-md p-3 border border-primary/10 flex items-center gap-2">
              {questionCount > 0 ? (
                <>
                  <Badge variant="outline" className="bg-primary/20 hover:bg-primary/30">
                    {questionCount}
                  </Badge>
                  <span className="text-muted-foreground">questões disponíveis para essa seleção</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-500 w-full justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>Nenhuma questão disponível com esses filtros</span>
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade de Questões</label>
            <Select 
              value={quantidade ? quantidade.toString() : "0"} 
              onValueChange={(value) => setQuantidade(Number(value))}
              disabled={availableQuantities.length === 0 || questionCount === 0}
            >
              <SelectTrigger className="bg-card border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableQuantities.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} questões
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {questionCount !== null && quantidade > questionCount && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Limitado a {questionCount} questões disponíveis
              </p>
            )}
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleStart}
            disabled={!selectedArea || selectedTemas.length === 0 || questionCount === 0 || loadingCount}
          >
            {loadingCount ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Calculando...
              </>
            ) : "Começar Estudo"}
          </Button>
        </CardContent>
      </Card>
      
      {!isMobile && (
        <div className="space-y-6">
          <TrendingThemes />
        </div>
      )}
    </div>
  );
};
