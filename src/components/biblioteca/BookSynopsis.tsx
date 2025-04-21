
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface BookSynopsisProps {
  synopsis?: string | null;
  isNarrating: boolean;
  narrationVolume: number;
  onNarrate: (text: string) => void;
  setNarrationVolume: (volume: number) => void;
}

const BookSynopsis: React.FC<BookSynopsisProps> = ({
  synopsis,
  isNarrating,
  narrationVolume,
  onNarrate,
  setNarrationVolume,
}) => (
  <div>
    <h3 className="text-sm font-medium text-muted-foreground mb-1">
      Sinopse
    </h3>
    <div className="relative">
      <p className="text-sm">{synopsis || "Sinopse não disponível"}</p>
      {synopsis && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0"
          onClick={() => onNarrate(synopsis || "")}
        >
          <Volume2 className={`h-4 w-4 ${isNarrating ? "text-primary" : ""}`} />
        </Button>
      )}
    </div>
    {isNarrating && (
      <div className="mt-2">
        <p className="text-xs mb-1">Volume: {narrationVolume}%</p>
        <Slider
          value={[narrationVolume]}
          min={0}
          max={100}
          step={5}
          onValueChange={value => setNarrationVolume(value[0])}
        />
      </div>
    )}
  </div>
);

export default BookSynopsis;
