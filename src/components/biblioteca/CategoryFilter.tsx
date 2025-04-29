import { Button } from "@/components/ui/button";
interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}
export function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory
}: CategoryFilterProps) {
  return <div className="mb-2 overflow-x-auto py-2 -mx-4 px-[15px]">
      <div className="flex gap-2 min-w-max">
        <Button variant={activeCategory === null ? "default" : "outline"} onClick={() => onSelectCategory(null)} size="sm" className="whitespace-nowrap">
          Todas as categorias
        </Button>
        {categories.map(categoria => <Button key={categoria} variant={activeCategory === categoria ? "default" : "outline"} onClick={() => onSelectCategory(categoria)} size="sm" className="whitespace-nowrap">
            {categoria}
          </Button>)}
      </div>
    </div>;
}