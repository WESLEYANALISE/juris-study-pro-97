
import React, { useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, BookmarkIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VadeMecumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: any[];
  recentHistory: any[];
}

export function VadeMecumDrawer({ 
  isOpen, 
  onClose, 
  favorites, 
  recentHistory 
}: VadeMecumDrawerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("favorites");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleNavigateToArticle = (lawName: string, articleId: string) => {
    navigate(`/vademecum/${lawName}/${articleId}`);
    onClose();
  };

  // Filter items based on search query
  const filteredFavorites = favorites.filter(item => 
    !searchQuery || 
    item.article_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.law_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.article_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = recentHistory.filter(item => 
    !searchQuery || 
    item.article_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.law_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.article_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-2">
          <div className="flex justify-between items-center mb-2">
            <DrawerTitle>Vade Mecum</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </DrawerClose>
          </div>
          
          <div className="relative my-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em favoritos e histórico..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="favorites" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                <span>Favoritos</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DrawerHeader>
        
        <div className="p-4">
          <TabsContent value="favorites" className="mt-0">
            <ScrollArea className="h-[60vh] pr-4">
              {filteredFavorites.length > 0 ? (
                <div className="space-y-2">
                  {filteredFavorites.map((item, index) => (
                    <Card 
                      key={`fav-${index}`}
                      className="p-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleNavigateToArticle(item.law_name, item.article_id)}
                    >
                      <div className="font-medium">Art. {item.article_number}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.law_name?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {item.article_text}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <BookmarkIcon className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Nenhum favorito encontrado." : "Você não tem favoritos ainda."}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <ScrollArea className="h-[60vh] pr-4">
              {filteredHistory.length > 0 ? (
                <div className="space-y-2">
                  {filteredHistory.map((item, index) => (
                    <Card 
                      key={`hist-${index}`}
                      className="p-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleNavigateToArticle(item.law_name, item.article_id)}
                    >
                      <div className="font-medium">Art. {item.article_number}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.law_name?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {item.article_text}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Nenhum item encontrado no histórico." : "Seu histórico está vazio."}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
