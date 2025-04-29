
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Book, Gavel, User, BookOpen, Users, MessageSquare, Key, Briefcase, GitBranch, FileText } from 'lucide-react';
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
      case 'book': return <Book className="h-5 w-5" />;
      case 'gavel': return <Gavel className="h-5 w-5" />;
      case 'user': return <User className="h-5 w-5" />;
      case 'book-open': return <BookOpen className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'message-square': return <MessageSquare className="h-5 w-5" />;
      case 'key': return <Key className="h-5 w-5" />;
      case 'briefcase': return <Briefcase className="h-5 w-5" />;
      case 'git-branch': return <GitBranch className="h-5 w-5" />;
      case 'file-text': return <FileText className="h-5 w-5" />;
      default: return <Book className="h-5 w-5" />;
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner size="lg" />
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
          <Card className="h-full flex flex-col hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-md bg-primary/10`}>
                  {getIconComponent(game.icone)}
                </span>
                <CardTitle className="text-lg">{game.nome}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
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
