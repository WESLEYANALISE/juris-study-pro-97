
import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { TrendingThemes } from "./TrendingThemes";

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

  const { data: questionCount } = useQuery({
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
      return count;
    }
  });

  const handleTemaToggle = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const handleStart = () => {
    if (!selectedArea) return;
    onStart({
      area: selectedArea,
      temas: selectedTemas,
      quantidade,
    });
  };

  if (loadingAreas) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configurar Questões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Área do Direito</label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
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
            <label className="text-sm font-medium">Temas</label>
            <div className="grid gap-2 max-h-48 overflow-auto p-2 border rounded-lg">
              {loadingTemas ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                temas?.map((tema) => (
                  <label key={tema} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={selectedTemas.includes(tema)}
                      onCheckedChange={() => handleTemaToggle(tema)}
                    />
                    <span className="text-sm">{tema}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {questionCount !== null && (
            <div className="text-sm text-muted-foreground">
              {questionCount} questões disponíveis para essa seleção
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade de Questões</label>
            <Select 
              value={quantidade.toString()} 
              onValueChange={(value) => setQuantidade(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} questões
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={handleStart}
            disabled={!selectedArea || selectedTemas.length === 0}
          >
            Começar
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <TrendingThemes />
      </div>
    </div>
  );
};
