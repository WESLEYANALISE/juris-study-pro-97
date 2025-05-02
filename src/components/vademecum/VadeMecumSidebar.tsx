
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bookmark, History, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VadeMecumSidebarProps {
  favorites: any[];
  recentHistory: any[];
}

export function VadeMecumSidebar({ favorites, recentHistory }: VadeMecumSidebarProps) {
  const navigate = useNavigate();

  const goToFavorites = () => {
    navigate('/vademecum/favoritos');
  };

  const handleNavigateToLaw = (lawName: string) => {
    navigate(`/vademecum/${lawName}`);
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="gap-2">
            <Bookmark className="h-4 w-4" />
            <span className="sm:inline">Favoritos</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <History className="h-4 w-4" />
            <span className="sm:inline">Recentes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="space-y-2 pt-2">
          <div className="p-1 text-center">
            <p className="mb-2 text-sm text-muted-foreground">
              {favorites.length > 0 ? 
                `Você tem ${favorites.length} artigos favoritos` : 
                'Adicione artigos aos favoritos para acesso rápido'}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToFavorites}
              className="w-full"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Ver todos os favoritos
            </Button>
          </div>
          
          {/* Show 3 most recent favorites as preview */}
          <div className="max-h-[200px] overflow-auto space-y-1 pt-1">
            {favorites.slice(0, 3).map((item, index) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-accent"
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
        
        <TabsContent value="recent" className="space-y-2">
          <div className="max-h-[400px] overflow-auto p-1">
            {recentHistory.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Nenhum artigo visualizado recentemente.
              </div>
            ) : (
              recentHistory.map((item, index) => (
                <div key={item.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-accent"
                    onClick={() => handleNavigateToLaw(item.law_name)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{item.law_name.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">Art. {item.article_number}</div>
                    </div>
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VadeMecumSidebar;
