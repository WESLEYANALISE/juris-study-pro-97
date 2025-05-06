
import React from 'react';
import { Brain, ChevronDown, BarChart, Clock, List, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FlashcardHeaderProps {
  userStats?: {
    totalStudied: number;
    todayStudied: number;
    masteredCards: number;
    streak: number;
  };
  onShowStats: () => void;
  isMobile: boolean;
  title?: string;
}

export const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({ 
  userStats, 
  onShowStats, 
  isMobile, 
  title = "Flashcards" 
}) => {
  return (
    <>
      {/* Header with stats toggle */}
      <div className="flex justify-between items-center mb-6">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{title}</h1>
            {userStats && (
              <p className="text-sm text-muted-foreground">
                Progresso diário: {userStats.todayStudied} cartões estudados
              </p>
            )}
          </div>

          {userStats && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="ml-2 bg-primary/10 border-primary/20 text-muted-foreground cursor-pointer hover:bg-primary/20 transition-all"
                >
                  Sequência: {userStats.streak} dias <ChevronDown className="h-3 w-3 ml-1 inline" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 bg-card border-primary/10">
                <DropdownMenuLabel>Seu progresso</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-between">
                  <span className="flex items-center gap-2"><List className="h-3.5 w-3.5" /> Total estudado</span> <span className="font-bold">{userStats.totalStudied}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Hoje</span> <span className="font-bold">{userStats.todayStudied}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  <span className="flex items-center gap-2"><Bookmark className="h-3.5 w-3.5" /> Dominados</span> <span className="font-bold">{userStats.masteredCards}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>

        {!isMobile && (
          <motion.button
            onClick={onShowStats}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart className="h-4 w-4" />
            Ver estatísticas detalhadas
          </motion.button>
        )}
      </div>
    </>
  );
};
