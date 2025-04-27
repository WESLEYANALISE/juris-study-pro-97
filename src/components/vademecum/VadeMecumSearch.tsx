
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion"; // Add this import
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface VadeMecumSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchOptions: {
    exactMatch: boolean;
    ignoreAccents: boolean;
    searchByNumber: boolean;
  };
  setSearchOptions: (options: any) => void;
  searchInputFocused: boolean;
  setSearchInputFocused: (focused: boolean) => void;
}

export function VadeMecumSearch({
  searchQuery,
  onSearchChange,
  searchOptions,
  setSearchOptions,
  searchInputFocused,
  setSearchInputFocused
}: VadeMecumSearchProps) {
  return (
    <motion.div 
      className={`sticky top-0 z-10 bg-background p-3 rounded-lg shadow-card transition-all duration-300 ${searchInputFocused ? 'shadow-hover' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Buscar artigos..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10"
            onFocus={() => setSearchInputFocused(true)}
            onBlur={() => setSearchInputFocused(false)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Opções de Busca
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
              ...prev,
              exactMatch: !prev.exactMatch
            }))}>
              <input type="checkbox" checked={searchOptions.exactMatch} className="mr-2" readOnly />
              Busca Exata
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
              ...prev,
              searchByNumber: !prev.searchByNumber
            }))}>
              <input type="checkbox" checked={searchOptions.searchByNumber} className="mr-2" readOnly />
              Buscar por Número
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
              ...prev,
              ignoreAccents: !prev.ignoreAccents
            }))}>
              <input type="checkbox" checked={searchOptions.ignoreAccents} className="mr-2" readOnly />
              Ignorar Acentos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
