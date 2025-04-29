
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

interface WelcomeCardProps {
  userName?: string;
  nextTaskTitle?: string;
  nextTaskTime?: string;
}

const WelcomeCard = ({
  userName,
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

  return (
    <Card className="gradient-welcome shadow-md mb-6 px-0 mx-[10px] overflow-hidden">
      <CardContent className="p-6 py-[15px] px-[8px] mx-[16px]">
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
  );
};

export default WelcomeCard;
