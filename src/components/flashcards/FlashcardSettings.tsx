import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer, Shuffle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <Timer className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full max-w-[200px] md:max-w-xs"
        />
        <span className="text-xs md:text-sm text-muted-foreground min-w-[24px]">{speed}s</span>
      </div>

      <div className="flex items-center justify-center gap-3 md:gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isAutoMode}
            onCheckedChange={onAutoModeChange}
            id="auto-mode"
            className="scale-90 md:scale-100"
          />
          <Label htmlFor="auto-mode" className="text-sm">Modo Automático</Label>
        </div>

        <Button 
          variant="outline"
          size="icon"
          onClick={onShuffle}
          className="h-8 w-8 md:h-10 md:w-10"
        >
          <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
};
