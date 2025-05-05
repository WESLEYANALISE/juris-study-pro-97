
import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CursoCategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
}

export function CursoCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className
}: CursoCategoryFilterProps) {
  return (
    <div className={cn("bg-card rounded-lg border shadow-sm p-4", className)}>
      <h3 className="font-medium mb-3">Áreas de Estudo</h3>
      <ScrollArea className="h-[280px] pr-3">
        <div className="space-y-1">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-start text-left font-normal"
            onClick={() => onSelectCategory(null)}
          >
            Todas as Áreas
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className="w-full justify-start text-left font-normal"
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
