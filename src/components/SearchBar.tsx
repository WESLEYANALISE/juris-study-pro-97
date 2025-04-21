
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
  id: string;
  title: string;
  path: string;
  type: "videoaula" | "biblioteca" | "noticia" | "blog" | "ferramenta" | "outro";
  description?: string;
};

const searchCategories = [
  { title: "Vídeo-aulas", path: "/videoaulas", keywords: ["aula", "video", "ensino"], type: "videoaula" },
  { title: "Jurisprudência", path: "/jurisprudencia", keywords: ["decisao", "tribunal", "stf", "stj"], type: "outro" },
  { title: "Notícias", path: "/noticias", keywords: ["noticia", "jornal", "informação"], type: "noticia" },
  { title: "Biblioteca", path: "/biblioteca", keywords: ["livro", "doutrina", "material"], type: "biblioteca" },
  { title: "Blog", path: "/bloger", keywords: ["blog", "artigo", "publicação"], type: "blog" },
  { title: "Peticionário", path: "/peticionario", keywords: ["peticao", "modelo", "documento"], type: "outro" },
  { title: "Vade Mecum", path: "/ferramentas/vademecum", keywords: ["legislação", "código", "lei"], type: "ferramenta" }
];

// Mock data for search results
const mockSearchResults: SearchResult[] = [
  { id: "1", title: "Direito Constitucional - Princípios Fundamentais", path: "/videoaulas", type: "videoaula", description: "Aula sobre os princípios fundamentais da Constituição" },
  { id: "2", title: "Manual de Direito Civil", path: "/biblioteca", type: "biblioteca", description: "Livro completo sobre Direito Civil" },
  { id: "3", title: "STF decide sobre Lei de Improbidade", path: "/noticias", type: "noticia", description: "Notícia sobre decisão recente do STF" },
  { id: "4", title: "Como usar o sistema de Flashcards", path: "/bloger", type: "blog", description: "Tutorial sobre o uso da ferramenta de flashcards" },
  { id: "5", title: "Código Civil Comentado", path: "/ferramentas/vademecum", type: "ferramenta", description: "Código Civil com anotações e jurisprudência" },
  { id: "6", title: "Direito Penal - Crimes contra a pessoa", path: "/videoaulas", type: "videoaula", description: "Aula sobre crimes contra a pessoa" },
  { id: "7", title: "Modelos de petição inicial", path: "/peticionario", type: "outro", description: "Templates de petições para diferentes áreas" },
  { id: "8", title: "Novas súmulas do STJ", path: "/noticias", type: "noticia", description: "Atualização sobre recentes súmulas do STJ" }
];

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "videoaula": return "Vídeo-aula";
    case "biblioteca": return "Biblioteca";
    case "noticia": return "Notícia";
    case "blog": return "Blog";
    case "ferramenta": return "Ferramenta";
    case "outro": return "Outros";
    default: return "Conteúdo";
  }
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case "videoaula": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case "biblioteca": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "noticia": return "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20";
    case "blog": return "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20";
    case "ferramenta": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
    case "outro": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    default: return "bg-primary/10 text-primary hover:bg-primary/20";
  }
};

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Filter mock results based on search query
      const results = mockSearchResults.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (result.description && result.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(results);
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Pesquisar conteúdo jurídico..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onFocus={() => setShowSuggestions(searchQuery.length > 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
          <Search className="h-3 w-3" />
        </button>
      </form>

      <AnimatePresence>
        {showSuggestions && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 z-50"
          >
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-2">
                <div className="max-h-[60vh] overflow-y-auto">
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center justify-between text-sm"
                          onClick={() => handleResultClick(result.path)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{result.title}</div>
                            {result.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {result.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={`ml-2 text-xs ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 pt-2 border-t flex justify-between items-center px-3">
                    <p className="text-xs text-muted-foreground">
                      {searchResults.length} resultados encontrados
                    </p>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setShowSuggestions(false);
                      }}
                    >
                      Ver todos os resultados
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
