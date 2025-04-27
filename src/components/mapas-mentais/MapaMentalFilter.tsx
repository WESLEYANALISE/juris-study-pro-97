
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Filter } from "lucide-react";

interface MapaMentalFilterProps {
  areas: string[];
  selectedArea: string;
  onAreaSelect: (area: string) => void;
}

export function MapaMentalFilter({
  areas,
  selectedArea,
  onAreaSelect,
}: MapaMentalFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {selectedArea || "Todas as áreas"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => onAreaSelect("")}
          className="flex items-center justify-between"
        >
          <span>Todas as áreas</span>
          {!selectedArea && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        {areas.map((area) => (
          <DropdownMenuItem
            key={area}
            onClick={() => onAreaSelect(area)}
            className="flex items-center justify-between"
          >
            <span>{area}</span>
            {selectedArea === area && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
