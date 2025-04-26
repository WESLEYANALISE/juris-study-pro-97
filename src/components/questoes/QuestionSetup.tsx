
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface QuestionSetupProps {
  onStart: (config: {
    area: string;
    tema: string;
    quantidade: number;
  }) => void;
}

export const QuestionSetup = ({ onStart }: QuestionSetupProps) => {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedTema, setSelectedTema] = useState<string>("");
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

  const handleStart = () => {
    if (!selectedArea) return;
    onStart({
      area: selectedArea,
      tema: selectedTema,
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
    <Card className="max-w-2xl mx-auto">
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
          <label className="text-sm font-medium">Tema</label>
          <Select 
            value={selectedTema} 
            onValueChange={setSelectedTema}
            disabled={!selectedArea || loadingTemas}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tema (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {temas?.map((tema) => (
                <SelectItem key={tema} value={tema}>
                  {tema}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          disabled={!selectedArea}
        >
          Começar
        </Button>
      </CardContent>
    </Card>
  );
};
