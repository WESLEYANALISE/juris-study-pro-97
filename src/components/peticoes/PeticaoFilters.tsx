
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface PeticaoFiltersProps {
  areas: string[];
  tipos: string[];
  onFilterChange: (filters: { 
    area?: string; 
    tipo?: string; 
    search?: string 
  }) => void;
}

export const PeticaoFilters: React.FC<PeticaoFiltersProps> = ({ 
  areas, 
  tipos, 
  onFilterChange 
}) => {
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [search, setSearch] = useState('');

  const handleFilterChange = () => {
    onFilterChange({ area, tipo, search });
  };

  const resetFilters = () => {
    setArea('');
    setTipo('');
    setSearch('');
    onFilterChange({});
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-grow relative">
        <Input 
          placeholder="Pesquisar petições..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      <div className="flex gap-4">
        <Select 
          value={area} 
          onValueChange={setArea}
        >
          <SelectTrigger>
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((areaItem) => (
              <SelectItem key={areaItem} value={areaItem}>
                {areaItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={tipo} 
          onValueChange={setTipo}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((tipoItem) => (
              <SelectItem key={tipoItem} value={tipoItem}>
                {tipoItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleFilterChange}
          >
            <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>
          <Button 
            variant="destructive" 
            onClick={resetFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
