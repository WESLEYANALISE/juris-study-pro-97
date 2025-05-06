
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Clock, History, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoundscapeVisualization } from '@/components/ui/soundscape-theme';

interface VadeMecumSidebarProps {
  favorites: any[];
  recentHistory: any[];
}

export function VadeMecumSidebar({
  favorites,
  recentHistory
}: VadeMecumSidebarProps) {
  const isPlaying = true; // For demonstration purposes

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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-background/95 to-purple-950/20 border-primary/20 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-6">
            {/* Favorites Section */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium uppercase text-muted-foreground">
                  Favoritos
                </h3>
              </div>
              
              <div className="space-y-2">
                {favorites.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic px-2">
                    Nenhum artigo favoritado
                  </p>
                ) : (
                  <ScrollArea className="h-[180px] pr-3">
                    {favorites.map((fav, index) => (
                      <Link 
                        key={index} 
                        to={`/vademecum/${fav.law_name}/${fav.article_id}`}
                        className="group"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 group-hover:border-primary/30 border border-transparent transition-all mb-2"
                        >
                          <div className={cn(
                            "min-w-8 h-8 rounded-md flex items-center justify-center",
                            "bg-purple-900/20 backdrop-blur-sm border border-primary/10 text-primary"
                          )}>
                            {fav.article_number.split(' ')[0]}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">{fav.article_text?.substring(0, 60)}...</p>
                            <p className="text-[10px] text-muted-foreground truncate">{fav.law_name}</p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </ScrollArea>
                )}
              </div>
            </motion.div>

            {/* Recent History Section */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium uppercase text-muted-foreground">
                  Histórico Recente
                </h3>
              </div>
              
              <ScrollArea className="h-[160px] pr-3">
                {recentHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic px-2">
                    Nenhum histórico recente
                  </p>
                ) : (
                  recentHistory.map((item, index) => (
                    <Link 
                      key={index} 
                      to={`/vademecum/${item.table_name}`}
                      className="group"
                    >
                      <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 group-hover:border-primary/30 border border-transparent transition-all mb-2"
                      >
                        <div className={cn(
                          "min-w-8 h-8 rounded-md flex items-center justify-center",
                          "bg-purple-900/20 backdrop-blur-sm border border-primary/10"
                        )}>
                          <Book className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-medium truncate">{item.table_name}</p>
                          <div className="flex items-center text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(item.viewed_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                )}
              </ScrollArea>
            </motion.div>
              
            <motion.div 
              variants={itemVariants}
              className="text-center p-3 border border-dashed border-primary/20 rounded-lg mt-4"
            >
              <div className="flex flex-col items-center">
                <div className="p-2 bg-primary/10 rounded-full">
                  <SoundscapeVisualization isPlaying={isPlaying} className="h-4 w-12" />
                </div>
                <h4 className="text-sm font-medium mt-2">Áudio-Leitura</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponível em breve
                </p>
                <Badge variant="outline" className="mt-2 text-[10px]">
                  Novidade
                </Badge>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
