
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowUp, Search, History, Bookmark, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import ArticleCard from "@/components/vademecum/ArticleCard";
import { useVadeMecumSearch } from "@/hooks/useVadeMecumSearch";
import { useVadeMecumPreferences } from "@/hooks/useVadeMecumPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useVadeMecumPreferences();
  const { 
    searchQuery, 
    setSearchQuery, 
    searchOptions, 
    setSearchOptions,
    filterArticles 
  } = useVadeMecumSearch();

  // Format the table name for display
  const displayName = tableName ? tableName.replace(/_/g, " ") : "";

  // Fetch articles
  const { data: articles = [], isLoading } = useQuery({
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
    enabled: !!tableName,
  });

  // Fetch recent history
  const { data: recentHistory = [] } = useQuery({
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
    },
  });

  // Fetch favorites
  const { data: favorites = [] } = useQuery({
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
    },
  });

  // Filter articles based on search
  const filteredArticles = filterArticles(articles, searchQuery);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => navigate("/vademecum")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Opções de Busca
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSearchOptions(prev => ({ ...prev, exactMatch: !prev.exactMatch }))}>
                  <input
                    type="checkbox"
                    checked={searchOptions.exactMatch}
                    className="mr-2"
                    readOnly
                  />
                  Busca Exata
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchOptions(prev => ({ ...prev, searchByNumber: !prev.searchByNumber }))}>
                  <input
                    type="checkbox"
                    checked={searchOptions.searchByNumber}
                    className="mr-2"
                    readOnly
                  />
                  Buscar por Número
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchOptions(prev => ({ ...prev, ignoreAccents: !prev.ignoreAccents }))}>
                  <input
                    type="checkbox"
                    checked={searchOptions.ignoreAccents}
                    className="mr-2"
                    readOnly
                  />
                  Ignorar Acentos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum artigo encontrado com os critérios de busca.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
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
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
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
              <div className="space-y-2">
                {favorites.map((favorite) => (
                  <Button
                    key={favorite.id}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => navigate(`/vademecum/${favorite.law_name}`)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{favorite.law_name.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">Art. {favorite.article_number}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-2">
                {recentHistory.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => navigate(`/vademecum/${item.law_name}`)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{item.law_name.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">Art. {item.article_number}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Button
        className="fixed bottom-6 right-6 z-10"
        size="icon"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VadeMecumViewer;
