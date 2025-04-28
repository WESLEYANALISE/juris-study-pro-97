
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
        <Button variant="outline" className={cn(className)}>
          {selectedArea}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <ScrollArea className="h-[300px]">
          {areas.map((area) => (
            <DropdownMenuItem
              key={area}
              onClick={() => onAreaSelect(area)}
              className={selectedArea === area ? "bg-muted" : ""}
            >
              {area}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
