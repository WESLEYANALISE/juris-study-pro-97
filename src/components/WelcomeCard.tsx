import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface WelcomeCardProps {
  userName?: string;
  progress?: number;
  nextTaskTitle?: string;
  nextTaskTime?: string;
}

const WelcomeCard = ({
  userName,
  progress = 0,
  nextTaskTitle,
  nextTaskTime
}: WelcomeCardProps) => {
  const navigate = useNavigate();
  const [lastStudyContent, setLastStudyContent] = useState<string | null>(null);

  useEffect(() => {
    setLastStudyContent("/videoaulas");
  }, []);

  const handleContinueStudying = () => {
    navigate(lastStudyContent || "/videoaulas");
  };

  const handleViewSchedule = () => {
    navigate("/inicie");
  };

  return <Card className="shadow-md bg-gradient-to-r from-primary/10 to-background border-primary/20 mb-6 px-0 mx-[10px]">
      <CardContent className="p-6 py-[15px] px-[8px] mx-[16px]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 min-w-32 flex items-center justify-center">
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`} className="text-primary" />
              </svg>
            </div>
            <div className="text-center z-10">
              <span className="text-3xl font-bold text-primary">{progress}%</span>
              <p className="text-xs text-muted-foreground">progresso</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                Olá, {userName || "Estudante"}!
              </h3>
              <p className="text-muted-foreground">
                Continue estudando para atingir seus objetivos.
              </p>
            </div>

            {nextTaskTitle && <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock size={16} />
                  <span>Próxima tarefa</span>
                  {nextTaskTime && <Badge variant="secondary" className="ml-auto">
                      {nextTaskTime}
                    </Badge>}
                </div>
                <p className="font-medium">{nextTaskTitle}</p>
              </div>}

            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleContinueStudying}>
                Continuar estudando
              </Button>
              <Button variant="outline" onClick={handleViewSchedule}>
                <Calendar className="mr-2 h-4 w-4" />
                Ver cronograma
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};

export default WelcomeCard;
