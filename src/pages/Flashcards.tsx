
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, BookOpen, ListChecks, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import FlashcardStudy from "@/components/flashcards/FlashcardStudy";
import FlashcardStats from "@/components/flashcards/FlashcardStats";

type FlashCard = Tables<"flash_cards">;

const Flashcards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<string[]>([]);
  const [temas, setTemas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedTema, setSelectedTema] = useState<string>("");
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("explorar");
  const [startStudy, setStartStudy] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);

  useEffect(() => {
    fetchFlashcardsCount();
    fetchAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      fetchTemas(selectedArea);
    }
  }, [selectedArea]);

  const fetchFlashcardsCount = async () => {
    try {
      const { count, error } = await supabase
        .from("flash_cards")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      setFlashcardsCount(count || 0);
    } catch (error) {
      console.error("Error fetching flashcards count:", error);
    }
  };

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("flash_cards")
        .select("area")
        .not("area", "is", null);
      
      if (error) throw error;
      const uniqueAreas = [...new Set(data.map(item => item.area))].filter(Boolean) as string[];
      setAreas(uniqueAreas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemas = async (area: string) => {
    try {
      const { data, error } = await supabase
        .from("flash_cards")
        .select("tema")
        .eq("area", area)
        .not("tema", "is", null);
      
      if (error) throw error;
      const uniqueTemas = [...new Set(data.map(item => item.tema))].filter(Boolean) as string[];
      setTemas(uniqueTemas);
    } catch (error) {
      console.error("Error fetching temas:", error);
    }
  };

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      let query = supabase.from("flash_cards").select("*");
      if (selectedArea) {
        query = query.eq("area", selectedArea);
      }
      if (selectedTema) {
        query = query.eq("tema", selectedTema);
      }
      const { data, error } = await query;
      
      if (error) throw error;
      setFlashcards(data as FlashCard[]);
      setStartStudy(true);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    setSelectedTema("");
  };

  const handleTemaChange = (value: string) => {
    setSelectedTema(value);
  };

  const resetStudy = () => {
    setStartStudy(false);
  };

  if (startStudy && flashcards.length > 0) {
    return <FlashcardStudy flashcards={flashcards} onBack={resetStudy} />;
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Flashcards</h1>
          <p className="text-muted-foreground text-center">
            Estude através de cartões de memorização
          </p>
        </div>
      </div>

      <Tabs defaultValue="explorar" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="explorar">Explorar</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explorar">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Explore Flashcards</CardTitle>
              <CardDescription>
                Selecione uma área do Direito e um tema para começar seus estudos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Área do Direito</label>
                    <Select value={selectedArea} onValueChange={handleAreaChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(area => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tema</label>
                    <Select value={selectedTema} onValueChange={handleTemaChange} disabled={!selectedArea}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedArea ? "Selecione um tema" : "Selecione uma área primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {temas.map(tema => (
                          <SelectItem key={tema} value={tema}>
                            {tema}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 mt-6">
                  <Button onClick={fetchFlashcards} disabled={!selectedArea || loading} className="w-full" size="lg">
                    Começar a Estudar
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="py-1">
                  <ListChecks className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">{flashcardsCount} flashcards disponíveis</span>
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("playlists")}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Criar Playlist
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="estatisticas">
          <FlashcardStats />
        </TabsContent>
        
        <TabsContent value="playlists">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Playlists de Estudo</CardTitle>
              <CardDescription>
                Crie playlists personalizadas com temas de diferentes áreas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="bg-muted/40 rounded-lg p-4 text-center">
                  <p className="text-sm">Você ainda não tem playlists de estudo.</p>
                  <Button className="mt-3" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Criar Nova Playlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Flashcards;
