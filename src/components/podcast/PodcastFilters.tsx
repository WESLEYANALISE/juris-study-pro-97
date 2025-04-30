
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface PodcastFiltersProps {
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string | null) => void;
  onSortChange: (sort: string) => void;
  categories?: { name: string; count: number }[];
  selectedCategory?: string | null;
}

export function PodcastFilters({ 
  onSearchChange, 
  onCategoryChange, 
  onSortChange, 
  categories = [],
  selectedCategory = null
}: PodcastFiltersProps) {
  return (
    <motion.div 
      className="mb-8 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Search and sort row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar podcasts..."
            className="pl-9"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select onValueChange={onSortChange} defaultValue="recent">
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="alphabetical">Alfabética</SelectItem>
              <SelectItem value="popular">Mais populares</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={!selectedCategory ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => onCategoryChange(null)}
          >
            Todos
          </Badge>
          
          {categories.map((category) => (
            <Badge 
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => onCategoryChange(category.name)}
            >
              {category.name}
              {category.count > 0 && <span className="ml-1 text-xs opacity-70">({category.count})</span>}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}
