
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import FlashcardStudy from "@/components/flashcards/FlashcardStudy";
import FlashcardStats from "@/components/flashcards/FlashcardStats";
import { ExploreTab } from "@/components/flashcards/ExploreTab";
import { PlaylistsTab } from "@/components/flashcards/PlaylistsTab";

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
    } else {
      setTemas([]);
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
      setFlashcardsCount(0);
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
      
      if (data && data.length > 0) {
        const areasWithValues = data
          .filter(item => item && item.area) // Ensure item and item.area exist
          .map(item => item.area as string)
          .filter(Boolean);
        
        const uniqueAreas = [...new Set(areasWithValues)];
        setAreas(uniqueAreas);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
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
      
      if (data && data.length > 0) {
        const temasWithValues = data
          .filter(item => item && item.tema) // Ensure item and item.tema exist
          .map(item => item.tema as string)
          .filter(Boolean);
        
        const uniqueTemas = [...new Set(temasWithValues)];
        setTemas(uniqueTemas);
      } else {
        setTemas([]);
      }
    } catch (error) {
      console.error("Error fetching temas:", error);
      setTemas([]);
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
      
      if (data && data.length > 0) {
        setFlashcards(data as FlashCard[]);
        setStartStudy(true);
      } else {
        console.log("No flashcards found for the selected criteria");
        setFlashcards([]);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setFlashcards([]);
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
          <ExploreTab
            loading={loading}
            areas={areas}
            temas={temas}
            selectedArea={selectedArea}
            selectedTema={selectedTema}
            onAreaChange={handleAreaChange}
            onTemaChange={handleTemaChange}
            onStartStudy={fetchFlashcards}
            flashcardsCount={flashcardsCount}
            onTabChange={setActiveTab}
          />
        </TabsContent>
        
        <TabsContent value="estatisticas">
          <FlashcardStats />
        </TabsContent>
        
        <TabsContent value="playlists">
          <PlaylistsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Flashcards;
