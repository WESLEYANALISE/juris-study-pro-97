
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowUp, 
  Search, 
  History, 
  Bookmark, 
  Settings2,
  Filter
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import ArticleCard from "@/components/vademecum/ArticleCard";
import { useVadeMecumSearch } from "@/hooks/useVadeMecumSearch";
import { useVadeMecumPreferences } from "@/hooks/useVadeMecumPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInView } from "react-intersection-observer";

// Number of items to load in each batch
const BATCH_SIZE = 5;

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useVadeMecumPreferences();
  const { searchQuery, setSearchQuery, searchOptions, setSearchOptions, filterArticles } = useVadeMecumSearch();
  
  const [visibleBatch, setVisibleBatch] = useState(BATCH_SIZE);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  
  // Reference for infinite loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Format the table name for display
  const displayName = useMemo(() => 
    tableName ? tableName.replace(/_/g, " ") : "", [tableName]);

  // Fetch articles
  const {
    data: articles = [],
    isLoading
  } = useQuery({
    queryKey: ["vadeMecum", tableName],
    queryFn: async () => {
      if (!tableName) return [];
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order('id');
        
      if (error) {
        console.error("Error fetching articles:", error);
        toast.error("Erro ao carregar artigos");
        throw error;
      }
      
      return data;
    },
    enabled: !!tableName
  });

  // Fetch recent history
  const {
    data: recentHistory = []
  } = useQuery({
    queryKey: ["vadeMecumHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vademecum_history')
        .select('*')
        .order('viewed_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Error fetching history:", error);
        return [];
      }
      
      return data;
    }
  });

  // Fetch favorites
  const {
    data: favorites = []
  } = useQuery({
    queryKey: ["vadeMecumFavorites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
      
      return data;
    }
  });

  // Filter articles based on search
  const filteredArticles = useMemo(() => 
    filterArticles(articles, searchQuery), [articles, searchQuery, searchOptions]);
    
  // Get only the visible articles based on the current batch
  const visibleArticles = useMemo(() => 
    filteredArticles.slice(0, visibleBatch), [filteredArticles, visibleBatch]);

  // Load more articles when scrolling to the bottom
  useEffect(() => {
    if (inView && visibleBatch < filteredArticles.length) {
      setVisibleBatch(prev => Math.min(prev + BATCH_SIZE, filteredArticles.length));
    }
  }, [inView, filteredArticles.length]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 px-3 sm:px-6"
    >
      <motion.div 
        className="flex items-center mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Button variant="ghost" onClick={() => navigate("/vademecum")} className="mr-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <motion.h1 
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {displayName}
        </motion.h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div 
          className="lg:col-span-3 space-y-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className={`sticky top-0 z-10 bg-background p-3 rounded-lg shadow-card transition-all duration-300 ${searchInputFocused ? 'shadow-hover' : ''}`}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar artigos..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10"
                  onFocus={() => setSearchInputFocused(true)}
                  onBlur={() => setSearchInputFocused(false)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Opções de Busca
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
                    ...prev,
                    exactMatch: !prev.exactMatch
                  }))}>
                    <input type="checkbox" checked={searchOptions.exactMatch} className="mr-2" readOnly />
                    Busca Exata
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
                    ...prev,
                    searchByNumber: !prev.searchByNumber
                  }))}>
                    <input type="checkbox" checked={searchOptions.searchByNumber} className="mr-2" readOnly />
                    Buscar por Número
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchOptions(prev => ({
                    ...prev,
                    ignoreAccents: !prev.ignoreAccents
                  }))}>
                    <input type="checkbox" checked={searchOptions.ignoreAccents} className="mr-2" readOnly />
                    Ignorar Acentos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <Skeleton className="h-32" />
                  </motion.div>
                ))
              ) : filteredArticles.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-muted-foreground">
                    Nenhum artigo encontrado com os critérios de busca.
                  </p>
                </motion.div>
              ) : (
                visibleArticles.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    lawName={tableName || ''}
                    articleNumber={article.numero || ''}
                    articleText={article.artigo}
                    technicalExplanation={article.tecnica}
                    formalExplanation={article.formal}
                    practicalExample={article.exemplo}
                    fontSize={fontSize}
                    onFontSizeChange={setFontSize}
                  />
                ))
              )}
            </AnimatePresence>
            
            {!isLoading && filteredArticles.length > visibleBatch && (
              <div ref={loadMoreRef} className="py-4 flex justify-center">
                <Skeleton className="h-8 w-32" />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="favorites" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Favoritos
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  Recentes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="favorites">
                <div className="space-y-2 max-h-[400px] overflow-auto p-1">
                  <AnimatePresence>
                    {favorites.map((favorite, index) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-accent"
                          onClick={() => navigate(`/vademecum/${favorite.law_name}`)}
                        >
                          <div className="truncate">
                            <div className="font-medium">{favorite.law_name.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-muted-foreground">Art. {favorite.article_number}</div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="space-y-2 max-h-[400px] overflow-auto p-1">
                  <AnimatePresence>
                    {recentHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-accent"
                          onClick={() => navigate(`/vademecum/${item.law_name}`)}
                        >
                          <div className="truncate">
                            <div className="font-medium">{item.law_name.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-muted-foreground">Art. {item.article_number}</div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="fixed bottom-6 right-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className="rounded-full shadow-lg"
          size="icon"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default VadeMecumViewer;
