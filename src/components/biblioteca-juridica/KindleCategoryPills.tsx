
import React from 'react';

interface KindleCategoryPillsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function KindleCategoryPills({
  categories,
  selectedCategory,
  onSelectCategory
}: KindleCategoryPillsProps) {
  return (
    <div className="kindle-category-pills flex overflow-x-auto pb-4 gap-2 hide-scrollbar">
      <div 
        className={`kindle-category-pill px-4 py-2 rounded-full cursor-pointer transition-all border ${!selectedCategory ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-muted'}`}
        onClick={() => onSelectCategory(null)}
      >
        Todas
      </div>
      
      {categories.map((category) => (
        <div 
          key={category}
          className={`kindle-category-pill whitespace-nowrap px-4 py-2 rounded-full cursor-pointer transition-all border ${selectedCategory === category ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-muted'}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );
}
