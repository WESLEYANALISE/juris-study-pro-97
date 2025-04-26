
import { Film, TvIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ContentFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
}

export const ContentFilters = ({ 
  search, 
  setSearch, 
  selectedType, 
  setSelectedType 
}: ContentFiltersProps) => {
  
  const getTypeButton = (tipo: string) => (
    <Button
      variant={selectedType === tipo ? "default" : "outline"}
      onClick={() => setSelectedType(selectedType === tipo ? null : tipo)}
      className="flex items-center gap-2 animate-in fade-in-50"
    >
      {getIcon(tipo)}
      <span className="capitalize">{tipo}</span>
    </Button>
  );

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "filme":
        return <Film className="h-5 w-5" />;
      case "serie":
        return <TvIcon className="h-5 w-5" />;
      case "documentário":
        return <Video className="h-5 w-5" />;
      default:
        return <Film className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
        {getTypeButton("filme")}
        {getTypeButton("serie")}
        {getTypeButton("documentário")}
      </div>
      
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};
