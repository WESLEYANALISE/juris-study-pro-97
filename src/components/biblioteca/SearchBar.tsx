
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BibliotecaViewSelector } from "./BibliotecaViewSelector";
import { motion } from "framer-motion";

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
    <motion.div 
      className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex-1 w-full">
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar livro, autor ou tema..."
          className="pr-10 bg-[#1d1d1d] border-[#333] text-white"
          list="livros-suggestions"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/60" />
        
        <datalist id="livros-suggestions">
          {livrosSuggestions?.map(livro => (
            <option key={livro.id} value={livro.livro} />
          ))}
        </datalist>
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <BibliotecaViewSelector 
          currentView={isCarouselView ? "carousel" : "list"}
          onViewChange={(view) => {
            if ((view === "carousel" && !isCarouselView) || 
                (view === "list" && isCarouselView)) {
              onViewChange();
            }
          }}
        />
        <Button 
          variant="default" 
          size="sm"
          onClick={onAIHelp}
          className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Ajuda IA
        </Button>
      </div>
    </motion.div>
  );
}
