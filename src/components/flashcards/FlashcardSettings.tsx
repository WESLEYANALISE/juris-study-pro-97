
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer, Shuffle } from "lucide-react";

interface FlashcardSettingsProps {
  speed: number;
  isAutoMode: boolean;
  onSpeedChange: (value: number) => void;
  onAutoModeChange: (checked: boolean) => void;
  onShuffle: () => void;
}

export const FlashcardSettings = ({
  speed,
  isAutoMode,
  onSpeedChange,
  onAutoModeChange,
  onShuffle,
}: FlashcardSettingsProps) => {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-center gap-4">
        <Timer className="h-5 w-5 text-muted-foreground" />
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full max-w-xs"
        />
        <span className="text-sm text-muted-foreground">{speed}s</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isAutoMode}
            onCheckedChange={onAutoModeChange}
            id="auto-mode"
          />
          <Label htmlFor="auto-mode">Modo Automático</Label>
        </div>

        <Button 
          variant="outline"
          size="icon"
          onClick={onShuffle}
          className="h-10 w-10"
        >
          <Shuffle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
