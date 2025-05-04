
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Settings, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FlashcardSetupProps = {
  onStartStudy: (config: {
    selectedTemas: string[];
    selectedArea: string | null;
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    cardCount: number;
  }) => void;
};

export function FlashcardSetup({ onStartStudy }: FlashcardSetupProps) {
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [studyMode, setStudyMode] = useState<"manual" | "auto">("manual");
  const [cardCount, setCardCount] = useState<number>(15);

  // Fetch available areas and themes
  const { data: areas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ["flashcard-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_cards_improved")
        .select("area")
        .not("area", "is", null);
      
      if (error) throw error;
      return Array.from(new Set(data.map(c => c.area)));
    },
  });

  const { data: temas = [], isLoading: loadingTemas } = useQuery({
    queryKey: ["flashcard-temas", selectedArea],
    enabled: !!selectedArea,
    queryFn: async () => {
      let query = supabase
        .from("flash_cards_improved")
        .select("tema")
        .not("tema", "is", null);
      
      if (selectedArea) {
        query = query.eq("area", selectedArea);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return Array.from(new Set(data.map(c => c.tema)));
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["flashcard-counts", selectedArea, selectedTemas],
    enabled: selectedArea !== null || selectedTemas.length > 0,
    queryFn: async () => {
      let query = supabase.from("flash_cards_improved").select("id", { count: "exact" });
      
      if (selectedArea) {
        query = query.eq("area", selectedArea);
      }
      
      if (selectedTemas.length > 0) {
        query = query.in("tema", selectedTemas);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return { count: count || 0 };
    }
  });

  const handleTemaToggle = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const handleStartStudy = () => {
    onStartStudy({
      selectedTemas,
      selectedArea,
      showAnswers,
      studyMode,
      cardCount: Math.min(cardCount, stats?.count || 100)
    });
  };

  const isStartDisabled = (selectedArea === null && selectedTemas.length === 0) || 
                          (stats?.count === 0);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-card via-[#9b87f515] to-card shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> 
          Configurar Sessão de Flashcards
        </CardTitle>
        <CardDescription>
          Personalize sua sessão de estudo selecionando os temas e configurando suas preferências
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {/* Area selection */}
            <div className="space-y-2">
              <Label>Área do Direito</Label>
              <Select
                value={selectedArea || "all"}
                onValueChange={(value) => setSelectedArea(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Temas selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Temas</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTemas(temas)}
                    disabled={temas.length === 0}
                  >
                    Todos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTemas([])}
                    disabled={selectedTemas.length === 0}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              {loadingTemas ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="border rounded-md p-4 h-48 overflow-y-auto flex flex-wrap gap-2">
                  {temas.length > 0 ? (
                    temas.map((tema) => (
                      <Badge 
                        key={tema}
                        variant={selectedTemas.includes(tema) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => handleTemaToggle(tema)}
                      >
                        {tema}
                      </Badge>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {selectedArea ? "Nenhum tema disponível para esta área" : "Selecione uma área para ver os temas"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card count */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quantidade de cartões</Label>
                  <p className="text-sm text-muted-foreground">
                    Total disponível: {stats?.count || 0} cartões
                  </p>
                </div>
                <Select
                  value={cardCount.toString()}
                  onValueChange={val => setCardCount(Number(val))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 cartões</SelectItem>
                    <SelectItem value="10">10 cartões</SelectItem>
                    <SelectItem value="15">15 cartões</SelectItem>
                    <SelectItem value="25">25 cartões</SelectItem>
                    <SelectItem value="50">50 cartões</SelectItem>
                    <SelectItem value="100">100 cartões</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <div className="border rounded-lg p-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-answers">Mostrar respostas automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Cartões já aparecerão com as respostas visíveis
                  </p>
                </div>
                <Switch
                  id="show-answers"
                  checked={showAnswers}
                  onCheckedChange={setShowAnswers}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Modo de estudo</Label>
                  <p className="text-sm text-muted-foreground">
                    Como você deseja navegar pelos cartões
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={studyMode === "manual" ? "default" : "outline"}
                    onClick={() => setStudyMode("manual")}
                    size="sm"
                  >
                    Manual
                  </Button>
                  <Button
                    variant={studyMode === "auto" ? "default" : "outline"}
                    onClick={() => setStudyMode("auto")}
                    size="sm"
                  >
                    Automático
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <div className="px-6 pb-6 pt-2">
        <Button 
          onClick={handleStartStudy} 
          disabled={isStartDisabled}
          size="lg"
          className="w-full gradient-button"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Iniciar Estudo
        </Button>
        
        {isStartDisabled && selectedArea && selectedTemas.length > 0 && (
          <p className="text-sm text-destructive mt-2 text-center">
            Nenhum flashcard disponível com os filtros selecionados.
          </p>
        )}
      </div>
    </Card>
  );
}
