
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bookmark, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VadeMecumSidebarProps {
  favorites: any[];
  recentHistory: any[];
}

export function VadeMecumSidebar({ favorites, recentHistory }: VadeMecumSidebarProps) {
  const navigate = useNavigate();

  return (
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
                {favorites.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Nenhum artigo favorito.
                  </div>
                ) : (
                  favorites.map((favorite, index) => (
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
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="space-y-2 max-h-[400px] overflow-auto p-1">
              <AnimatePresence>
                {recentHistory.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Nenhum artigo visualizado recentemente.
                  </div>
                ) : (
                  recentHistory.map((item, index) => (
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
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
