
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const TrendingThemes = () => {
  const { data: trendingThemes, isLoading } = useQuery({
    queryKey: ["trending-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temas_trending")
        .select("*")
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Temas em Alta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingThemes?.map((theme) => (
          <div key={theme.Tema} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{theme.Tema}</p>
              <p className="text-sm text-muted-foreground">{theme.Area}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{theme.total_usuarios} usuários</p>
              <p className="text-sm text-muted-foreground">
                {theme.percentual_acertos.toFixed(1)}% de acertos
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
