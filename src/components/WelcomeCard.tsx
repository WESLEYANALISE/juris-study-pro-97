
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Clock, BarChart, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeCardProps {
  userName?: string;
  nextTaskTitle?: string;
  nextTaskTime?: string;
  progress?: number;
}

const WelcomeCard = ({
  userName,
  nextTaskTitle,
  nextTaskTime,
  progress = 0
}: WelcomeCardProps) => {
  const navigate = useNavigate();
  const [lastStudyContent, setLastStudyContent] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setLastStudyContent("/videoaulas");
    
    // Adiciona efeito de animação quando o componente é montado
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(progress);
    }, 800);
    return () => clearTimeout(timer);
  }, [progress]);

  const handleContinueStudying = () => {
    navigate(lastStudyContent || "/videoaulas");
  };

  const handleViewSchedule = () => {
    navigate("/inicie");
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
        when: "beforeChildren" 
      }
    }
  };
  
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="gradient-welcome shadow-purple border-primary/20 mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="flex-1 space-y-4">
              <motion.div variants={childVariants} className="relative">
                <h3 className="text-2xl md:text-3xl font-bold mb-1">
                  Olá, {userName || "Estudante"}!
                </h3>
                <p className="text-muted-foreground">
                  Continue estudando para atingir seus objetivos.
                </p>
                <AnimatePresence>
                  {showAnimation && (
                    <motion.div 
                      className="absolute -top-1 -right-1 text-secondary"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {nextTaskTitle && nextTaskTime && (
                <motion.div 
                  variants={childVariants} 
                  className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border border-primary/10 mt-3 hover-lift"
                >
                  <div className="flex items-center text-primary mb-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Próxima atividade</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p className="font-medium">{nextTaskTitle}</p>
                    <p className="text-sm text-muted-foreground">Data: {nextTaskTime}</p>
                  </div>
                </motion.div>
              )}

              {progress > 0 && (
                <motion.div variants={childVariants} className="space-y-1">
                  <div className="flex items-center justify-between text-primary">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Seu progresso</span>
                    </div>
                    <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {progressValue}%
                    </span>
                  </div>
                  <div className="h-2 relative rounded-full overflow-hidden bg-primary/10">
                    <Progress value={progressValue} className="h-full absolute inset-0" />
                  </div>
                </motion.div>
              )}

              <motion.div variants={childVariants} className="flex flex-wrap gap-3 mt-5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleContinueStudying} className="gradient-button">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Continuar estudando
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" onClick={handleViewSchedule} className="hover-lift border-primary/20 hover:bg-primary/5">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver cronograma
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeCard;
