
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AreaSelectorProps {
  areas: string[];
  selectedArea: string;
  onAreaSelect: (area: string) => void;
  className?: string;
}

export const AreaSelector = ({ areas, selectedArea, onAreaSelect, className }: AreaSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("w-full sm:w-auto justify-between truncate", className)}>
          <span className="truncate">{selectedArea}</span>
          <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] max-w-[90vw] z-50">
        <ScrollArea className="h-[300px] max-h-[50vh]">
          {areas.map((area) => (
            <DropdownMenuItem
              key={area}
              onClick={() => onAreaSelect(area)}
              className={cn(
                "cursor-pointer truncate", 
                selectedArea === area ? "bg-muted" : ""
              )}
            >
              {area}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
