
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Clock, BarChart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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

  useEffect(() => {
    setLastStudyContent("/videoaulas");
  }, []);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const handleContinueStudying = () => {
    navigate(lastStudyContent || "/videoaulas");
  };

  const handleViewSchedule = () => {
    navigate("/inicie");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="gradient-welcome shadow-purple border-primary/20 mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Olá, {userName || "Estudante"}!
                </h3>
                <p className="text-muted-foreground">
                  Continue estudando para atingir seus objetivos.
                </p>
              </div>

              {nextTaskTitle && nextTaskTime && (
                <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border border-primary/10 mt-3">
                  <div className="flex items-center text-primary mb-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Próxima atividade</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p className="font-medium">{nextTaskTitle}</p>
                    <p className="text-sm text-muted-foreground">Data: {nextTaskTime}</p>
                  </div>
                </div>
              )}

              {progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center text-primary">
                    <BarChart className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Seu progresso</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={handleContinueStudying} className="gradient-button">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Continuar estudando
                </Button>
                <Button variant="outline" onClick={handleViewSchedule} className="hover-lift">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver cronograma
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeCard;
