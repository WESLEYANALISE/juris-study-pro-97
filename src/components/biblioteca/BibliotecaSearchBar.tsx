
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AIRecommendations from "@/components/biblioteca/AIRecommendations";

interface BibliotecaSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  books: any[];
  onOpenAnnotations: () => void;
  askAiForRecommendation: (query: string) => Promise<{ result: string; books: any[]; }>;
  openBookDialog: (book: any) => void;
}

const BibliotecaSearchBar: React.FC<BibliotecaSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  books,
  onOpenAnnotations,
  askAiForRecommendation,
  openBookDialog
}) => (
  <div className="w-full max-w-sm mx-auto flex items-center relative mt-2">
    <Input
      type="text"
      placeholder="Pesquisar livros..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      className="pl-10"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <div className="ml-2">
      <AIRecommendations 
        askAiForRecommendation={askAiForRecommendation} 
        books={books} 
        openBookDialog={openBookDialog} 
      />
    </div>
  </div>
);

export default BibliotecaSearchBar;
