
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Search, Grid3X3, Clock, Puzzle, SplitSquareVertical, 
  ListTodo, Shuffle, BookText, Grid2X2
} from 'lucide-react';
import type { GameCategory } from '@/pages/JogosJuridicos';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface JogosGameGridProps {
  games: GameCategory[];
  isLoading: boolean;
}

export const JogosGameGrid = ({ games, isLoading }: JogosGameGridProps) => {
  const navigate = useNavigate();
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'search': return <Search className="h-5 w-5" />;
      case 'grid-3x3': return <Grid3X3 className="h-5 w-5" />;
      case 'hang-up': return <Clock className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      case 'square-split-vertical': return <SplitSquareVertical className="h-5 w-5" />;
      case 'list-todo': return <ListTodo className="h-5 w-5" />;
      case 'shuffle': return <Shuffle className="h-5 w-5" />;
      case 'abc': return <BookText className="h-5 w-5" />; // Changed from AlphaBracket to BookText
      case 'memory': return <Grid2X2 className="h-5 w-5" />;
      default: return <Puzzle className="h-5 w-5" />;
    }
  };
  
  const getDifficultyColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'text-green-500';
      case 'intermediário': return 'text-amber-500';
      case 'avançado': return 'text-red-500';
      default: return 'text-primary';
    }
  };
  
  const getBackgroundStyle = (variant: string) => {
    switch (variant) {
      case 'scales': return 'bg-gradient-to-br from-green-900/20 to-green-700/10';
      case 'courthouse': return 'bg-gradient-to-br from-amber-900/20 to-amber-700/10';
      case 'constitution': return 'bg-gradient-to-br from-blue-900/20 to-blue-700/10';
      case 'books': return 'bg-gradient-to-br from-indigo-900/20 to-indigo-700/10';
      case 'gavel': return 'bg-gradient-to-br from-rose-900/20 to-rose-700/10';
      case 'landmark': return 'bg-gradient-to-br from-purple-900/20 to-purple-700/10';
      case 'scroll': return 'bg-gradient-to-br from-orange-900/20 to-orange-700/10';
      default: return 'bg-gradient-to-br from-slate-900/20 to-slate-700/10';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (games.length === 0) {
    return (
      <div className="text-center p-12 border border-white/10 rounded-lg bg-card/30">
        <p className="text-muted-foreground">Nenhum jogo encontrado nesta categoria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className={`h-full flex flex-col border border-white/10 shadow-card hover:shadow-glow transition-all duration-300 ${getBackgroundStyle(game.background_variant)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-glass text-primary">
                  {getIconComponent(game.icone)}
                </span>
                <CardTitle className="text-lg">{game.nome}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2 text-gray-300">
                {game.descricao}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${getDifficultyColor(game.nivel_dificuldade)}`}>
                  Dificuldade: {game.nivel_dificuldade}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="gradient"
                onClick={() => navigate(`/jogos/${game.id}`)}
              >
                Jogar Agora
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
