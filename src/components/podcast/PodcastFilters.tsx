
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PodcastFiltersProps {
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onSortChange: (value: string) => void;
}

export function PodcastFilters({
  onSearchChange,
  onCategoryChange,
  onSortChange
}: PodcastFiltersProps) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('podcast_categories')
          .select('id, name, slug')
          .order('name');
        
        if (error) {
          console.error('Error loading categories:', error);
          return;
        }
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading podcast categories:', err);
      }
    };
    
    loadCategories();
  }, []);
  
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };
  
  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    onCategoryChange(value);
    // Close mobile sheet after selection on mobile
    setIsFilterOpen(false);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSortBy("recent");
    onCategoryChange(null);
    onSortChange("recent");
    setIsFilterOpen(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 pr-10"
          placeholder="Buscar podcasts por título ou descrição..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtrar podcasts</SheetTitle>
              <SheetDescription>
                Ajuste os filtros para encontrar podcasts específicos
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Categorias</h4>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category.id}`} 
                        checked={selectedCategory === category.slug}
                        onCheckedChange={() => handleCategoryChange(
                          selectedCategory === category.slug ? null : category.slug
                        )}
                      />
                      <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Ordenar por</h4>
                <RadioGroup value={sortBy} onValueChange={handleSortChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recent" id="recent" />
                    <Label htmlFor="recent">Mais recentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="popular" id="popular" />
                    <Label htmlFor="popular">Mais ouvidos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alphabetical" id="alphabetical" />
                    <Label htmlFor="alphabetical">Ordem alfabética</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <SheetFooter>
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Limpar filtros
              </Button>
              <Button onClick={() => setIsFilterOpen(false)} className="w-full">
                Aplicar filtros
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(null)}
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
