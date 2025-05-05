
import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useVadeMecumFavorites } from "@/hooks/useVadeMecumFavorites";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { Search, ArrowLeft, Book, BookOpen, XCircle } from "lucide-react";
import { useVadeMecumDisplay } from '@/hooks/useVadeMecumDisplay';
import { motion } from "framer-motion";

const VadeMecumFavorites = () => {
  const { favorites, loadFavorites, removeFavorite, isLoading } = useVadeMecumFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupedFavorites, setGroupedFavorites] = useState<Record<string, any[]>>({});
  const { fontSize } = useVadeMecumDisplay();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Group favorites by law
  useEffect(() => {
    const grouped = favorites.reduce((acc, favorite) => {
      const lawName = favorite.law_name;
      if (!acc[lawName]) {
        acc[lawName] = [];
      }
      acc[lawName].push(favorite);
      return acc;
    }, {} as Record<string, any[]>);
    
    setGroupedFavorites(grouped);
  }, [favorites]);

  // Filter favorites based on search
  const filteredGroupedFavorites = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedFavorites;

    const result: Record<string, any[]> = {};
    
    Object.entries(groupedFavorites).forEach(([lawName, articles]) => {
      const filteredArticles = articles.filter(
        article => 
          article.article_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
          article.article_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lawName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredArticles.length > 0) {
        result[lawName] = filteredArticles;
      }
    });
    
    return result;
  }, [groupedFavorites, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const handleGoToLaw = (lawName: string) => {
    navigate(`/vademecum/${lawName}`);
  };

  const handleRemoveFavorite = async (lawName: string, articleNumber: string) => {
    await removeFavorite(articleNumber, lawName);
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/vademecum")}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meus Artigos Favoritos</h1>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-8 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Buscar favoritos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {Object.keys(filteredGroupedFavorites).length === 0 ? (
          <div className="bg-card shadow-sm rounded-lg p-8 text-center">
            {searchQuery ? (
              <p className="text-muted-foreground">
                Nenhum favorito encontrado com essa busca.
              </p>
            ) : (
              <div>
                <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">Sem favoritos ainda</h2>
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem artigos favoritos. Navegue pelo Vade Mecum e adicione artigos aos favoritos para acesso rápido.
                </p>
                <Button onClick={() => navigate("/vademecum")}>
                  Explorar Vade Mecum
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(filteredGroupedFavorites).map(([lawName, items]) => (
              <Card key={lawName} className="overflow-hidden">
                <div className="p-4 bg-primary/5 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <BookOpen size={18} />
                    <h3>{lawName.replace(/_/g, ' ')}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleGoToLaw(lawName)}
                  >
                    Ver Lei
                  </Button>
                </div>
                <div className="px-2 py-1 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.law_name}-${item.article_number}`}
                      className="p-3 border-b last:border-0 hover:bg-muted/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Art. {item.article_number}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" 
                          onClick={() => handleRemoveFavorite(item.law_name, item.article_number)}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                      <div 
                        className="text-sm text-muted-foreground line-clamp-3"
                        style={{ fontSize: `${fontSize - 2}px` }}
                      >
                        {item.article_text}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 h-6 text-xs"
                        onClick={() => handleGoToLaw(item.law_name)}
                      >
                        Ver no contexto
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </JuridicalBackground>
  );
};

export default VadeMecumFavorites;
