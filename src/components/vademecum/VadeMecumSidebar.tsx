
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VadeMecumDrawer } from "./VadeMecumDrawer";

interface VadeMecumSidebarProps {
  favorites: any[];
  recentHistory: any[];
}

export function VadeMecumSidebar({ favorites, recentHistory }: VadeMecumSidebarProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"favorites" | "history">("favorites");
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const openFavoritesDrawer = () => {
    setDrawerType("favorites");
    setDrawerOpen(true);
  };
  
  const openHistoryDrawer = () => {
    setDrawerType("history");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const navigateToArticle = (lawName: string, articleId: string) => {
    navigate(`/vademecum/${lawName}/${articleId}`);
  };

  return (
    <>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 sticky top-4"
      >
        {/* Favorites Section */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-background/60 border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Favoritos</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs hover:bg-primary/10" 
                  onClick={openFavoritesDrawer}
                >
                  Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-44 p-2">
              {favorites.length > 0 ? (
                <div className="space-y-1 p-1">
                  {favorites.slice(0, 5).map((fav, index) => (
                    <div
                      key={fav.id || index}
                      onClick={() => navigateToArticle(fav.law_name, fav.article_id)}
                      className="group flex flex-col p-2 rounded-md hover:bg-primary/5 cursor-pointer transition-all"
                    >
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        Art. {fav.article_number}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {fav.law_name?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Bookmark className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Nenhum favorito ainda. Marque artigos para acesso rápido.
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Recent History Section */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-background/60 border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Histórico</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs hover:bg-primary/10"
                  onClick={openHistoryDrawer}
                >
                  Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-44 p-2">
              {recentHistory.length > 0 ? (
                <div className="space-y-1 p-1">
                  {recentHistory.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id || index}
                      onClick={() => navigateToArticle(item.law_name, item.article_id)}
                      className="group flex flex-col p-2 rounded-md hover:bg-primary/5 cursor-pointer transition-all"
                    >
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        Art. {item.article_number}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.law_name?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Clock className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Nenhuma visualização recente. Os artigos visualizados aparecerão aqui.
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add the drawer component */}
      <VadeMecumDrawer 
        isOpen={drawerOpen} 
        onClose={closeDrawer} 
        favorites={favorites} 
        recentHistory={recentHistory} 
      />
    </>
  );
}
