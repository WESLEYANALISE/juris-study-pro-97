
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Search, Grid3X3, Clock, Puzzle, SplitSquareVertical, 
  ListTodo, Shuffle, AlphaBracket, Grid2X2
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
      case 'abc': return <AlphaBracket className="h-5 w-5" />;
      case 'memory': return <Grid2X2 className="h-5 w-5" />;
      default: return <Puzzle className="h-5 w-5" />;
    }
  };
  
  const getDifficultyColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'text-green-600';
      case 'intermediário': return 'text-amber-600';
      case 'avançado': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };
  
  const getBackgroundStyle = (variant: string) => {
    switch (variant) {
      case 'scales': return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'courthouse': return 'bg-gradient-to-br from-amber-50 to-amber-100';
      case 'constitution': return 'bg-gradient-to-br from-blue-50 to-blue-100';
      case 'books': return 'bg-gradient-to-br from-indigo-50 to-indigo-100';
      case 'gavel': return 'bg-gradient-to-br from-rose-50 to-rose-100';
      case 'landmark': return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'scroll': return 'bg-gradient-to-br from-orange-50 to-orange-100';
      default: return 'bg-gradient-to-br from-slate-50 to-slate-100';
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
      <div className="text-center p-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhum jogo encontrado nesta categoria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className={`h-full flex flex-col hover:shadow-md transition-all duration-200 ${getBackgroundStyle(game.background_variant)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-white/80 text-primary">
                  {getIconComponent(game.icone)}
                </span>
                <CardTitle className="text-lg">{game.nome}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2 text-gray-700">
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
