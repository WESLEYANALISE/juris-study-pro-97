
import React, { useState, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

interface FilterOption {
  value: string;
  label: string;
  checked: boolean;
}

interface DicionarioFilterProps {
  onFilterChange: (selectedAreas: string[]) => void;
  className?: string;
}

export const DicionarioFilter: React.FC<DicionarioFilterProps> = ({ onFilterChange, className }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCount = options.filter(option => option.checked).length;

  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('dicionario_juridico')
          .select('area_direito');
        
        if (data) {
          // Extract all areas from the comma-separated list in each row
          const allAreas = data
            .flatMap(item => item.area_direito ? item.area_direito.split(',').map(area => area.trim()) : [])
            .filter(Boolean);
          
          // Get unique areas
          const uniqueAreas = [...new Set(allAreas)].sort();
          
          // Create options
          setOptions(uniqueAreas.map(area => ({
            value: area,
            label: area,
            checked: false
          })));
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newOptions = options.map(option => 
      option.value === value ? { ...option, checked } : option
    );
    setOptions(newOptions);
    
    const selectedAreas = newOptions
      .filter(option => option.checked)
      .map(option => option.value);
    
    onFilterChange(selectedAreas);
  };

  const handleClearFilters = () => {
    const newOptions = options.map(option => ({ ...option, checked: false }));
    setOptions(newOptions);
    onFilterChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn("relative", className, selectedCount > 0 && "border-primary")}
        >
          <Filter className={cn("h-4 w-4", selectedCount > 0 && "text-primary")} />
          {selectedCount > 0 && (
            <span className="absolute top-0 right-0 -mr-1 -mt-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {selectedCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtrar por área</h4>
            {selectedCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
        
        <div className="py-2 max-h-[300px] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : (
            options.map((option) => (
              <div key={option.value} className="flex items-center px-4 py-2 hover:bg-muted/50">
                <Checkbox
                  id={`filter-${option.value}`}
                  checked={option.checked}
                  onCheckedChange={(checked) => handleCheckboxChange(option.value, !!checked)}
                />
                <label
                  htmlFor={`filter-${option.value}`}
                  className="ml-2 text-sm cursor-pointer flex-1"
                >
                  {option.label}
                </label>
                {option.checked && <Check className="h-3 w-3 text-primary" />}
              </div>
            ))
          )}
          
          {!isLoading && options.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Nenhuma área encontrada
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
