
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface QuestionStatsProps {
  stats: Tables<"user_questoes_stats"> | null;
}

export const QuestionStats = ({ stats }: QuestionStatsProps) => {
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Desempenho</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Questões</p>
            <p className="text-2xl font-bold">{stats.total_respondidas}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Acertos</p>
            <p className="text-2xl font-bold">{stats.total_acertos}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Percentual de Acertos</p>
            <p className="text-2xl font-bold">{stats.percentual_acertos.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Área Principal</p>
            <p className="text-2xl font-bold">{stats.area || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
