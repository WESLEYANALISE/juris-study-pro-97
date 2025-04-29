
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Zap, Target, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface GameElementsProps {
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
}

export function GameElements({ correctAnswers, totalAnswers, streak }: GameElementsProps) {
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const [lastAchievement, setLastAchievement] = useState<string | null>(null);
  const { toast } = useToast();
  
  // For demo purposes, trigger badge achievement after 3 correct answers
  useEffect(() => {
    if (correctAnswers === 3 && !lastAchievement) {
      setLastAchievement("Iniciante");
      setShowBadgeAnimation(true);
      
      toast({
        title: "Nova conquista!",
        description: "Você desbloqueou a conquista 'Iniciante'!",
        variant: "success",
      });
      
      setTimeout(() => {
        setShowBadgeAnimation(false);
      }, 4000);
    }
  }, [correctAnswers, toast, lastAchievement]);

  // Calculate metrics
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const level = Math.floor(correctAnswers / 5) + 1;
  const levelProgress = (correctAnswers % 5) / 5 * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary text-primary-foreground">
                Nível {level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {5 - (correctAnswers % 5)} questões para o próximo nível
              </span>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${levelProgress}%` }} 
            />
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">{accuracy}%</span>
              <span className="text-xs text-muted-foreground">Precisão</span>
            </div>
            
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">{correctAnswers}</span>
              <span className="text-xs text-muted-foreground">Acertos</span>
            </div>
            
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">{streak}</span>
              <span className="text-xs text-muted-foreground">Sequência</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Badges section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {lastAchievement && (
              <Badge 
                className="bg-gradient-to-r from-primary to-purple-600 text-white cursor-pointer"
                onClick={() => toast({ title: "Conquistado!", description: "Responda 3 questões corretamente." })}
              >
                Iniciante
              </Badge>
            )}
            
            <Badge 
              variant="outline" 
              className="opacity-50 cursor-pointer"
              onClick={() => toast({ title: "Bloqueado", description: "Responda 10 questões corretamente." })}
            >
              Estudioso
            </Badge>
            
            <Badge 
              variant="outline" 
              className="opacity-50 cursor-pointer"
              onClick={() => toast({ title: "Bloqueado", description: "Alcance uma sequência de 5 respostas corretas." })}
            >
              Consistente
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement animation */}
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            className="fixed bottom-24 right-4 z-50"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-primary animate-pulse overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-primary rounded-full p-2">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Nova conquista!</h4>
                  <p className="text-sm text-muted-foreground">Iniciante desbloqueado</p>
                </div>
              </CardContent>
              <div className="h-1 bg-primary w-full animate-progress"></div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
