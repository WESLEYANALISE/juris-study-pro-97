
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Progress } from "@/components/ui/progress";
import { Award, Brain, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface QuestionStatsProps {
  stats: Tables<"user_questoes_stats"> | null;
  isLoading?: boolean;
}

export const QuestionStats = ({ stats, isLoading = false }: QuestionStatsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-6 bg-muted animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;
  
  const statItems = [
    { 
      icon: <Brain className="h-5 w-5 text-primary" />,
      label: "Total de Questões", 
      value: stats.total_respondidas
    },
    { 
      icon: <Target className="h-5 w-5 text-emerald-500" />,
      label: "Acertos", 
      value: stats.total_acertos 
    },
    { 
      icon: <Award className="h-5 w-5 text-amber-500" />,
      label: "Percentual de Acertos", 
      value: `${stats.percentual_acertos.toFixed(1)}%` 
    },
    { 
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      label: "Área Principal", 
      value: stats.area || "N/A" 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Seu Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxa de Acerto</span>
              <span className="font-medium">{stats.percentual_acertos.toFixed(1)}%</span>
            </div>
            <Progress value={stats.percentual_acertos} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                </div>
                <p className="text-2xl font-bold">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
