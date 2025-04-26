
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onViewChange: () => void;
  isCarouselView: boolean;
  onAIHelp: () => void;
  livrosSuggestions?: { id: string; livro: string; }[];
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onViewChange,
  isCarouselView,
  onAIHelp,
  livrosSuggestions
}: SearchBarProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div className="flex-1 flex flex-col gap-2">
        <div className="relative">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar livro, autor ou tema..."
            className="pr-10 bg-black/20 border-gray-700 focus:border-primary text-white placeholder:text-gray-400"
            list="livros-suggestions"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          
          <datalist id="livros-suggestions">
            {livrosSuggestions?.map(livro => (
              <option key={livro.id} value={livro.livro} />
            ))}
          </datalist>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewChange}
          className="text-white hover:bg-gray-800"
        >
          {isCarouselView ? (
            <>Lista</>
          ) : (
            <>Carousel</>
          )}
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onAIHelp}
          className="bg-[#D32F2F] hover:bg-[#E53935] text-white"
        >
          Ajuda IA
        </Button>
      </div>
    </div>
  );
}
