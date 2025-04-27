
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
import { Search, Filter, X, CalendarRange, Tags } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ptBR } from 'date-fns/locale';

interface PeticaoFiltersProps {
  areas: string[];
  tipos: string[];
  onFilterChange: (filters: { 
    area?: string; 
    tipo?: string; 
    search?: string;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    tags?: string[];
  }) => void;
  availableTags?: string[];
}

export const PeticaoFilters: React.FC<PeticaoFiltersProps> = ({ 
  areas, 
  tipos, 
  onFilterChange,
  availableTags = ["Urgente", "Modelo", "Importante", "Criminal", "Civil", "Trabalhista", "Administrativo"]
}) => {
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleFilterChange = () => {
    onFilterChange({ area, tipo, search, dateFrom, dateTo, tags: selectedTags.length > 0 ? selectedTags : undefined });
  };

  const resetFilters = () => {
    setArea('');
    setTipo('');
    setSearch('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedTags([]);
    onFilterChange({});
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Input 
            placeholder="Pesquisar petições..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Select 
            value={area} 
            onValueChange={setArea}
          >
            <SelectTrigger className="min-w-[150px]">
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
            <SelectTrigger className="min-w-[150px]">
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
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                <CalendarRange className="mr-2 h-4 w-4" />
                {dateFrom ? (
                  dateTo ? (
                    <>
                      {format(dateFrom, "dd/MM/yy")} - {format(dateTo, "dd/MM/yy")}
                    </>
                  ) : (
                    format(dateFrom, "dd/MM/yy")
                  )
                ) : (
                  "Data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                locale={ptBR}
                selected={{
                  from: dateFrom,
                  to: dateTo,
                }}
                onSelect={(range) => {
                  setDateFrom(range?.from);
                  setDateTo(range?.to);
                }}
                className="rounded-md border"
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Tags className="mr-2 h-4 w-4" />
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="flex flex-wrap gap-2 max-w-[300px]">
                {availableTags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleFilterChange}
          className="transition-all hover:shadow-md"
        >
          <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
        </Button>
        <Button 
          variant="destructive" 
          onClick={resetFilters}
          className="transition-all hover:shadow-md"
        >
          <X className="h-4 w-4 mr-2" /> Limpar
        </Button>
      </div>
    </div>
  );
};
