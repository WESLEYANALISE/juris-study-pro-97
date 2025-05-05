
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Filter, LayoutList, LayoutGrid, Library, Heart, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFiltersBarProps {
  categories: {
    name: string;
    count: number;
  }[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  activeFilter: 'all' | 'progress' | 'favorites';
  setActiveFilter: (filter: 'all' | 'progress' | 'favorites') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  resetFilters: () => void;
}

export function MobileFiltersBar({
  categories,
  selectedCategory,
  onCategoryChange,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
  resetFilters
}: MobileFiltersBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  return (
    <motion.div 
      className="bg-black/95 backdrop-blur-md border-b border-purple-900/30 px-3 mb-4 relative" 
      initial={{ height: 60 }}
      animate={{ height: isExpanded ? 160 : 60 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle button */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-8 w-8 rounded-full p-0 shadow-lg border border-purple-900/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Horizontal category scroller (always visible) */}
      <div className="h-[60px] flex items-center">
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex items-center gap-2 py-2 px-1">
            <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer hover:bg-primary/90 transition-colors whitespace-nowrap" onClick={() => onCategoryChange(null)}>
              Todos
            </Badge>
            
            {categories.map(category => <Badge key={category.name} variant={selectedCategory === category.name ? "default" : "outline"} className="cursor-pointer hover:bg-primary/90 transition-colors whitespace-nowrap" onClick={() => onCategoryChange(category.name)}>
                {category.name}
                {category.count > 0 && <span className="ml-1 text-xs opacity-70">({category.count})</span>}
              </Badge>)}
          </div>
        </ScrollArea>
      </div>

      {/* Expanded filters and options (visible when expanded) */}
      <div className="overflow-hidden">
        <div className="flex flex-col gap-3 px-2 py-3">
          {/* Filter buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(['all', 'progress', 'favorites'] as const).map(filter => <Button key={filter} variant="ghost" size="sm" className={cn("px-2 py-1 h-auto", activeFilter === filter ? "bg-purple-900/30 text-purple-400" : "text-gray-400")} onClick={() => setActiveFilter(filter)}>
                  {filter === 'all' ? <Library className="h-3 w-3 mr-1" /> : filter === 'progress' ? <Clock className="h-3 w-3 mr-1" /> : <Heart className="h-3 w-3 mr-1" />}
                  <span className="text-xs">
                    {filter === 'all' ? 'Todos' : filter === 'progress' ? 'Em Progresso' : 'Favoritos'}
                  </span>
                </Button>)}
            </div>
            
            {/* View mode toggle */}
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className={cn("w-8 h-8 p-0", viewMode === 'grid' && "bg-purple-900/30 text-purple-300")} onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className={cn("w-8 h-8 p-0", viewMode === 'list' && "bg-purple-900/30 text-purple-300")} onClick={() => setViewMode('list')}>
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Reset filters button */}
          <Button variant="outline" size="sm" className="w-full border-purple-800/50 text-xs" onClick={() => {
          resetFilters();
          setIsExpanded(false);
        }}>
            Limpar filtros
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default MobileFiltersBar;
