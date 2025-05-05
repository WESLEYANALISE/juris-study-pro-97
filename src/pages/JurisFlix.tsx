import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { FeaturedContent } from "@/components/jurisflix/FeaturedContent";
import { ContentFilters } from "@/components/jurisflix/ContentFilters";
import { ContentGrid } from "@/components/jurisflix/ContentGrid";
import { ContentModal } from "@/components/jurisflix/ContentModal";
import { SearchBar } from "@/components/biblioteca/SearchBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Film, Tv, Star, TrendingUp, History, Bookmark, Gavel } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search as SearchIcon } from 'lucide-react';

interface JurisFlixItem {
  id: number;
  nome: string;
  ano: string;
  sinopse: string;
  nota: string;
  plataforma: string;
  link: string;
  capa: string;
  beneficios: string;
  trailer: string;
  tipo: string;
  categoria?: string;
  em_alta?: boolean;
}

const mockData: JurisFlixItem[] = [
  {
    id: 1,
    nome: "O Julgamento de Chicago 7",
    ano: "2020",
    sinopse: "O filme retrata o julgamento dos manifestantes que protestaram contra a Guerra do Vietnã durante a Convenção Nacional Democrata de 1968.",
    nota: "8.5",
    plataforma: "Netflix",
    link: "https://www.netflix.com/title/81043755",
    capa: "https://m.media-amazon.com/images/M/MV5BYjYzOGE1MjUtODgyMy00ZDAxLTljYTgtNzk0Njg2YWQwMTZhXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
    beneficios: "Excelente para entender conceitos de direito processual e liberdade de expressão.",
    trailer: "https://www.youtube.com/embed/FVb6EdKDBfU",
    tipo: "filme",
    categoria: "Direito Processual",
    em_alta: true
  },
  {
    id: 2,
    nome: "Justiça Sem Limites",
    ano: "2019",
    sinopse: "Série que aborda casos jurídicos complexos e dilemas éticos enfrentados por advogados.",
    nota: "7.9",
    plataforma: "Amazon Prime",
    link: "https://www.primevideo.com",
    capa: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB9I1XGPVhUmlnZ6X0Fzy4nyrFNvZIZTAQiq4pKtbYQt2H5XAYMbjPwYpxqhu8axyDBuo&usqp=CAU",
    beneficios: "Apresenta casos de diversas áreas do direito e discute ética profissional.",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tipo: "serie",
    categoria: "Ética Jurídica"
  },
  {
    id: 3,
    nome: "A Firma",
    ano: "1993",
    sinopse: "Um jovem advogado descobre que sua firma de advocacia está envolvida em atividades ilegais.",
    nota: "7.2",
    plataforma: "Netflix",
    link: "https://www.netflix.com",
    capa: "https://br.web.img3.acsta.net/medias/nmedia/18/91/08/82/20128877.JPG",
    beneficios: "Explora questões de ética profissional e confidencialidade advogado-cliente.",
    trailer: "https://www.youtube.com/embed/CcPd_MWVjHU",
    tipo: "filme",
    categoria: "Ética Jurídica"
  }
];

const JurisFlix = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("todos");
  const [selectedItem, setSelectedItem] = useState<JurisFlixItem | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [searchResults, setSearchResults] = useState<JurisFlixItem[]>([]);
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);
  
  // Handle clicks outside search preview
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchPreview(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Query with improved configuration for debugging and caching
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["jurisflix"],
    queryFn: async () => {
      console.log("Fetching JurisFlix data from Supabase...");
      try {
        // Insert small delay to prevent rapid refetching
        await new Promise(r => setTimeout(r, 100));
        
        const { data, error } = await supabase
          .from("Jurisflix")
          .select("*");

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No data returned from Supabase, using mock data");
          setUseMockData(true);
          return mockData;
        }
        
        return data as JurisFlixItem[];
      } catch (error) {
        console.error("Error fetching JurisFlix data:", error);
        toast.error("Erro ao carregar dados. Usando dados locais.");
        setUseMockData(true);
        return mockData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  
  // Filter items based on search text, selected type and tab
  const getFilteredItems = () => {
    let filtered = [...items];
    
    // Filter by search
    if (debouncedSearch) {
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.plataforma.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        item.sinopse.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // Filter by content type
    if (selectedType) {
      filtered = filtered.filter(item => item.tipo === selectedType);
    }
    
    // Filter by selected tab
    switch (selectedTab) {
      case "filmes":
        filtered = filtered.filter(item => item.tipo === "filme");
        break;
      case "series":
        filtered = filtered.filter(item => item.tipo === "serie");
        break;
      case "documentarios":
        filtered = filtered.filter(item => item.tipo === "documentario");
        break;
      case "em_alta":
        filtered = filtered.filter(item => item.em_alta);
        break;
      default:
        // "todos" - no additional filtering
        break;
    }
    
    return filtered;
  };
  
  // Update search results when search changes
  useEffect(() => {
    if (debouncedSearch.length > 2) {
      const results = items.filter(item => 
        item.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.plataforma.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        item.sinopse.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchPreview(true);
    } else {
      setSearchResults([]);
      setShowSearchPreview(false);
    }
  }, [debouncedSearch, items]);
  
  const handleSelectItem = (item: JurisFlixItem) => {
    // Handle reset type event from ContentGrid
    if (item.id === -1 && item.tipo === "reset") {
      setSelectedType(null);
      return;
    }
    
    setSelectedItem(item);
    setShowSearchPreview(false);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length > 2) {
      setShowSearchPreview(true);
    } else {
      setShowSearchPreview(false);
    }
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.02}>
      <div className="container mx-auto px-4 md:p-4 space-y-6 pb-20">
        <motion.header 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-red-400 to-primary bg-clip-text text-transparent">
              JurisFlix
            </h1>
            <motion.span 
              className="absolute -inset-2 rounded-full opacity-10 bg-red-500 blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ zIndex: -1 }}
            />
            <div className="flex justify-center">
              <Gavel className="h-8 w-8 text-primary mx-auto mt-2" />
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Descubra filmes, séries e documentários jurídicos
          </p>
        </motion.header>
        
        {/* Search with Preview */}
        <div ref={searchRef} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por título, plataforma ou área jurídica..."
              className="w-full h-12 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-card focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          {/* Search Preview Results */}
          <AnimatePresence>
            {showSearchPreview && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 z-50 bg-card shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto"
              >
                <div className="p-2">
                  <h3 className="text-sm font-medium px-2 py-1 text-muted-foreground">
                    Resultados da pesquisa ({searchResults.length})
                  </h3>
                  
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                      >
                        <div className="h-12 w-9 rounded overflow-hidden flex-shrink-0">
                          {item.capa ? (
                            <img 
                              src={item.capa} 
                              alt={item.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              {item.tipo === "filme" ? <Film size={16} /> : <Tv size={16} />}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{item.nome}</h4>
                            {item.nota && (
                              <div className="flex items-center text-xs text-amber-500">
                                <Star size={12} className="fill-amber-500" />
                                <span>{item.nota}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.ano}</span>
                            <span>•</span>
                            <span>{item.plataforma}</span>
                            {item.categoria && (
                              <>
                                <span>•</span>
                                <span>{item.categoria}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <FeaturedContent onSelectItem={handleSelectItem} />
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto mb-6">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              <span>Todos</span>
            </TabsTrigger>
            <TabsTrigger value="filmes" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              <span>Filmes</span>
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              <span>Séries</span>
            </TabsTrigger>
            <TabsTrigger value="documentarios" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Documentários</span>
            </TabsTrigger>
            <TabsTrigger value="em_alta" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Em Alta</span>
            </TabsTrigger>
          </TabsList>
        
          <ContentFilters 
            search={search}
            setSearch={setSearch}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />

          <TabsContent value="todos">
            <ContentGrid 
              items={getFilteredItems()}
              search={search}
              selectedType={selectedType}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="filmes">
            <ContentGrid 
              items={getFilteredItems()}
              search={search}
              selectedType={selectedType}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="series">
            <ContentGrid 
              items={getFilteredItems()}
              search={search}
              selectedType={selectedType}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="documentarios">
            <ContentGrid 
              items={getFilteredItems()}
              search={search}
              selectedType={selectedType}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="em_alta">
            <ContentGrid 
              items={getFilteredItems()}
              search={search}
              selectedType={selectedType}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        <ContentModal 
          item={selectedItem}
          isOpen={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />

        {/* Information footer when mock data is being used */}
        {useMockData && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-lg text-center">
            <p className="text-amber-800 dark:text-amber-300">
              Exibindo dados de demonstração. Alguns recursos podem estar limitados.
            </p>
          </div>
        )}
      </div>
    </JuridicalBackground>
  );
};

export default JurisFlix;
