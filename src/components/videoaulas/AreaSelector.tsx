
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface AreaSelectorProps {
  areas: string[];
  selectedArea: string;
  onAreaSelect: (area: string) => void;
}

export const AreaSelector = ({ areas, selectedArea, onAreaSelect }: AreaSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          {selectedArea}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {areas.map((area) => (
          <DropdownMenuItem
            key={area}
            onClick={() => onAreaSelect(area)}
          >
            {area}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
