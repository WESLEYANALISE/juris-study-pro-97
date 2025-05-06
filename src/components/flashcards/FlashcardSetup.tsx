
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Settings, 
  Sparkles, 
  Clock, 
  SlidersHorizontal, 
  Lightbulb,
  ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type FlashcardSetupProps = {
  onStartStudy: (config: {
    selectedTemas: string[];
    selectedAreas: string[];
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    autoNarrate: boolean;
    cardCount: number;
    spaceInterval: "normal" | "short" | "long";
  }) => void;
};

export function FlashcardSetup({ onStartStudy }: FlashcardSetupProps) {
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(true);
  const [studyMode, setStudyMode] = useState<"manual" | "auto">("manual");
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [cardCount, setCardCount] = useState<number>(15);
  const [spaceInterval, setSpaceInterval] = useState<"normal" | "short" | "long">("normal");
  
  // Dropdown menu state
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false);
  const [isTemasDropdownOpen, setIsTemasDropdownOpen] = useState(false);

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
    queryKey: ["flashcard-temas", selectedAreas],
    enabled: selectedAreas.length > 0 || true,
    queryFn: async () => {
      let query = supabase
        .from("flash_cards_improved")
        .select("tema")
        .not("tema", "is", null);
      
      if (selectedAreas.length > 0) {
        query = query.in("area", selectedAreas);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return Array.from(new Set(data.map(c => c.tema)));
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["flashcard-counts", selectedAreas, selectedTemas],
    enabled: selectedAreas.length > 0 || selectedTemas.length > 0,
    queryFn: async () => {
      let query = supabase.from("flash_cards_improved").select("id", { count: "exact" });
      
      if (selectedAreas.length > 0) {
        query = query.in("area", selectedAreas);
      }
      
      if (selectedTemas.length > 0) {
        query = query.in("tema", selectedTemas);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return { count: count || 0 };
    }
  });

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleTemaToggle = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const handleSelectAllAreas = () => {
    setSelectedAreas([...areas]);
    setIsAreasDropdownOpen(false);
  };

  const handleClearAreas = () => {
    setSelectedAreas([]);
    setIsAreasDropdownOpen(false);
  };

  const handleSelectAllTemas = () => {
    setSelectedTemas([...temas]);
    setIsTemasDropdownOpen(false);
  };

  const handleClearTemas = () => {
    setSelectedTemas([]);
    setIsTemasDropdownOpen(false);
  };

  const handleStartStudy = () => {
    onStartStudy({
      selectedTemas,
      selectedAreas,
      showAnswers,
      studyMode,
      autoNarrate,
      cardCount: Math.min(cardCount, stats?.count || 100),
      spaceInterval
    });
  };

  const isStartDisabled = (selectedAreas.length === 0 && selectedTemas.length === 0) || 
                          (stats?.count === 0);

  const staggerAnimationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633] shadow-lg border-primary/20">
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {/* Area selection - Now with dropdown */}
            <motion.div className="space-y-2" {...staggerAnimationProps}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Áreas do Direito</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllAreas}
                    disabled={areas.length === 0}
                    className="bg-primary/10 border-primary/20 text-xs"
                  >
                    Todas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAreas}
                    disabled={selectedAreas.length === 0}
                    className="bg-primary/10 border-primary/20 text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              {/* Areas Dropdown */}
              <DropdownMenu open={isAreasDropdownOpen} onOpenChange={setIsAreasDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-[#1A1633]/80 border-primary/20 h-auto py-3"
                  >
                    <span>
                      {selectedAreas.length === 0 
                        ? "Selecione as áreas" 
                        : `${selectedAreas.length} área${selectedAreas.length > 1 ? 's' : ''} selecionada${selectedAreas.length > 1 ? 's' : ''}`}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-[300px] overflow-y-auto bg-[#1A1633] border-primary/20">
                  <DropdownMenuLabel>Áreas do Direito</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {loadingAreas ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Carregando áreas...</p>
                      </div>
                    ) : (
                      areas.map((area) => (
                        <DropdownMenuItem 
                          key={area} 
                          onClick={() => handleAreaToggle(area)}
                          className="cursor-pointer flex justify-between items-center"
                        >
                          <span>{area}</span>
                          {selectedAreas.includes(area) && 
                            <Badge className="ml-2 bg-primary">Selecionado</Badge>
                          }
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Selected areas display */}
              {selectedAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAreas.map(area => (
                    <Badge 
                      key={area} 
                      className="bg-primary cursor-pointer"
                      onClick={() => handleAreaToggle(area)}
                    >
                      {area} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Temas selection - Now with dropdown */}
            <motion.div className="space-y-2" {...staggerAnimationProps} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-2">
                <Label>Temas</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllTemas}
                    disabled={temas.length === 0}
                    className="bg-primary/10 border-primary/20 text-xs"
                  >
                    Todos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearTemas}
                    disabled={selectedTemas.length === 0}
                    className="bg-primary/10 border-primary/20 text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              {/* Temas Dropdown */}
              <DropdownMenu open={isTemasDropdownOpen} onOpenChange={setIsTemasDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-[#1A1633]/80 border-primary/20 h-auto py-3"
                    disabled={loadingTemas}
                  >
                    {loadingTemas ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></span>
                        Carregando temas...
                      </span>
                    ) : (
                      <span>
                        {selectedTemas.length === 0 
                          ? "Selecione os temas" 
                          : `${selectedTemas.length} tema${selectedTemas.length > 1 ? 's' : ''} selecionado${selectedTemas.length > 1 ? 's' : ''}`}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-[350px] overflow-y-auto bg-[#1A1633] border-primary/20">
                  <DropdownMenuLabel>Temas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {loadingTemas ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Carregando temas...</p>
                      </div>
                    ) : temas.length > 0 ? (
                      temas.map((tema) => (
                        <DropdownMenuItem 
                          key={tema} 
                          onClick={() => handleTemaToggle(tema)}
                          className="cursor-pointer flex justify-between items-center"
                        >
                          <span className="mr-2 line-clamp-1">{tema}</span>
                          {selectedTemas.includes(tema) && 
                            <Badge className="ml-2 bg-primary shrink-0">Selecionado</Badge>
                          }
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        {selectedAreas.length > 0 
                          ? "Nenhum tema disponível para as áreas selecionadas" 
                          : "Selecione uma área para ver os temas"}
                      </div>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Selected temas display */}
              {selectedTemas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-h-[150px] overflow-y-auto border border-primary/10 p-2 rounded-md">
                  {selectedTemas.map(tema => (
                    <Badge 
                      key={tema} 
                      className="bg-primary cursor-pointer"
                      onClick={() => handleTemaToggle(tema)}
                    >
                      {tema} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Card count */}
            <motion.div className="mt-6 pt-4 border-t border-primary/10" {...staggerAnimationProps} transition={{ delay: 0.2 }}>
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
                  <SelectTrigger className="w-32 bg-[#1A1633]/80 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1633] border-primary/20">
                    <SelectItem value="5">5 cartões</SelectItem>
                    <SelectItem value="10">10 cartões</SelectItem>
                    <SelectItem value="15">15 cartões</SelectItem>
                    <SelectItem value="25">25 cartões</SelectItem>
                    <SelectItem value="50">50 cartões</SelectItem>
                    <SelectItem value="100">100 cartões</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <div className="border border-primary/10 rounded-lg p-4 space-y-6 bg-[#1A1633]/50">
              <motion.div className="flex items-center justify-between" {...staggerAnimationProps}>
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
              </motion.div>

              <motion.div 
                className="flex items-center justify-between pt-4 border-t border-primary/10"
                {...staggerAnimationProps} 
                transition={{ delay: 0.1 }}
              >
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
                    className={studyMode !== "manual" ? "bg-[#1A1633]/80 border-primary/20" : ""}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={studyMode === "auto" ? "default" : "outline"}
                    onClick={() => setStudyMode("auto")}
                    size="sm"
                    className={studyMode !== "auto" ? "bg-[#1A1633]/80 border-primary/20" : ""}
                  >
                    Automático
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-between pt-4 border-t border-primary/10"
                {...staggerAnimationProps}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-0.5">
                  <Label htmlFor="auto-narrate">Narração automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Ler automaticamente pergunta e resposta
                  </p>
                </div>
                <Switch
                  id="auto-narrate"
                  checked={autoNarrate}
                  onCheckedChange={setAutoNarrate}
                />
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="border border-primary/10 rounded-lg p-4 bg-[#1A1633]/50">
              <motion.div className="space-y-4" {...staggerAnimationProps}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Intervalo de repetição</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={spaceInterval === "short" ? "default" : "outline"}
                    onClick={() => setSpaceInterval("short")}
                    size="sm"
                    className={cn(
                      "flex flex-col h-auto py-3 gap-1",
                      spaceInterval !== "short" ? "bg-[#1A1633]/80 border-primary/20" : ""
                    )}
                  >
                    <span>Curto</span>
                    <span className="text-xs font-normal text-muted-foreground">1-3 dias</span>
                  </Button>
                  <Button
                    variant={spaceInterval === "normal" ? "default" : "outline"}
                    onClick={() => setSpaceInterval("normal")}
                    size="sm"
                    className={cn(
                      "flex flex-col h-auto py-3 gap-1",
                      spaceInterval !== "normal" ? "bg-[#1A1633]/80 border-primary/20" : ""
                    )}
                  >
                    <span>Normal</span>
                    <span className="text-xs font-normal text-muted-foreground">3-7 dias</span>
                  </Button>
                  <Button
                    variant={spaceInterval === "long" ? "default" : "outline"}
                    onClick={() => setSpaceInterval("long")}
                    size="sm"
                    className={cn(
                      "flex flex-col h-auto py-3 gap-1",
                      spaceInterval !== "long" ? "bg-[#1A1633]/80 border-primary/20" : ""
                    )}
                  >
                    <span>Longo</span>
                    <span className="text-xs font-normal text-muted-foreground">7-14 dias</span>
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <h3 className="font-medium">Dica de estudo</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A repetição espaçada é uma técnica de estudo que envolve revisar o conteúdo em intervalos 
                    crescentes para melhorar a retenção na memória de longo prazo.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="border border-primary/10 rounded-lg p-4 bg-[#1A1633]/50"
              {...staggerAnimationProps}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Configurações de visualização</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-theme" className="text-sm">Tema escuro</Label>
                    <Switch id="dark-theme" checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations" className="text-sm">Animações</Label>
                    <Switch id="animations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size" className="text-sm">Fonte grande</Label>
                    <Switch id="font-size" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-keywords" className="text-sm">Destacar palavras-chave</Label>
                    <Switch id="highlight-keywords" />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-2">
        <motion.div
          className="w-full"
          whileHover={{ scale: isStartDisabled ? 1 : 1.02 }}
          whileTap={{ scale: isStartDisabled ? 1 : 0.98 }}
        >
          <Button 
            onClick={handleStartStudy} 
            disabled={isStartDisabled}
            size="lg"
            className="w-full bg-gradient-to-r from-primary/90 via-purple-600/90 to-primary/90 shadow-lg hover:shadow-purple-600/20 border border-primary/20 transition-all duration-300"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Iniciar Estudo
          </Button>
        </motion.div>
        
        {isStartDisabled && selectedAreas.length > 0 && selectedTemas.length > 0 && (
          <p className="text-sm text-destructive mt-2 text-center w-full">
            Nenhum flashcard disponível com os filtros selecionados.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
