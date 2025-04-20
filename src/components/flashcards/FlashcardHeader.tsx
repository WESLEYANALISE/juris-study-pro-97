
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface FlashcardHeaderProps {
  currentIndex: number;
  totalCards: number;
  progress: number;
  currentFlashcard: Tables<"flash_cards">;
  onBack: () => void;
}

export const FlashcardHeader = ({
  currentIndex,
  totalCards,
  progress,
  currentFlashcard,
  onBack,
}: FlashcardHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="py-1.5">
            {currentIndex + 1} / {totalCards}
          </Badge>
          <Badge variant="secondary" className="py-1.5">
            {currentFlashcard.area || "Sem área"}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="mb-6 h-2" />
    </>
  );
};
