
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  selectedArea: string | null;
  setSelectedArea: (value: string | null) => void;
  areas: string[];
  clearFilters: () => void;
  filtering: boolean;
}

export const CourseFilters = ({
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedArea,
  setSelectedArea,
  areas,
  clearFilters,
  filtering
}: CourseFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select
            value={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediário">Intermediário</SelectItem>
              <SelectItem value="avançado">Avançado</SelectItem>
            </SelectContent>
          </Select>

          {filtering && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
      
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedArea === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedArea(null)}
          >
            Todas as áreas
          </Badge>
          {areas.map(area => (
            <Badge
              key={area}
              variant={selectedArea === area ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedArea(area)}
            >
              {area}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
