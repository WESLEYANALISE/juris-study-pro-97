
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
    <div className="kindle-category-pills hide-scrollbar">
      <div 
        className={`kindle-category-pill ${!selectedCategory ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        Todas
      </div>
      
      {categories.map((category) => (
        <div 
          key={category}
          className={`kindle-category-pill ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );
}
