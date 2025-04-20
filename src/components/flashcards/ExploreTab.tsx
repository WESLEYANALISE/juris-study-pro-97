
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, PlusCircle } from "lucide-react";
import { FlashcardSelectors } from "./FlashcardSelectors";

interface ExploreTabProps {
  loading: boolean;
  areas: string[];
  temas: string[];
  selectedArea: string;
  selectedTema: string;
  onAreaChange: (value: string) => void;
  onTemaChange: (value: string) => void;
  onStartStudy: () => void;
  flashcardsCount: number;
  onTabChange: (value: string) => void;
}

export const ExploreTab = ({
  loading,
  areas,
  temas,
  selectedArea,
  selectedTema,
  onAreaChange,
  onTemaChange,
  onStartStudy,
  flashcardsCount,
  onTabChange,
}: ExploreTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Explore Flashcards</CardTitle>
        <CardDescription>
          Selecione uma área do Direito e um tema para começar seus estudos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FlashcardSelectors
            loading={loading}
            areas={areas}
            temas={temas}
            selectedArea={selectedArea}
            selectedTema={selectedTema}
            onAreaChange={onAreaChange}
            onTemaChange={onTemaChange}
          />
          
          <div className="grid grid-cols-1 gap-3 mt-6">
            <Button 
              onClick={onStartStudy} 
              disabled={!selectedArea || loading}
              className="w-full" 
              size="lg"
            >
              {loading ? "Carregando..." : "Começar a Estudar"}
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
        <Button variant="outline" size="sm" onClick={() => onTabChange("playlists")}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Criar Playlist
        </Button>
      </CardFooter>
    </Card>
  );
};
