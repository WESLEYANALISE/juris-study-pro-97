
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const searchCategories = [
  { title: "Vídeo-aulas", path: "/videoaulas", keywords: ["aula", "video", "ensino"] },
  { title: "Jurisprudência", path: "/jurisprudencia", keywords: ["decisao", "tribunal", "stf", "stj"] },
  { title: "Notícias", path: "/noticias", keywords: ["noticia", "jornal", "informação"] },
  { title: "Biblioteca", path: "/biblioteca", keywords: ["livro", "doutrina", "material"] },
  { title: "Peticionário", path: "/peticionario", keywords: ["peticao", "modelo", "documento"] }
];

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const filteredCategories = searchQuery.length > 0
    ? searchCategories.filter(category => 
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.keywords.some(keyword => keyword.includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Pesquisar conteúdo jurídico..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
          <Search className="h-3 w-3" />
        </button>
      </form>

      {showSuggestions && filteredCategories.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-2">
            <ul>
              {filteredCategories.map((category, index) => (
                <li key={index}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center text-sm"
                    onClick={() => {
                      navigate(category.path);
                      setShowSuggestions(false);
                      setSearchQuery("");
                    }}
                  >
                    <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
