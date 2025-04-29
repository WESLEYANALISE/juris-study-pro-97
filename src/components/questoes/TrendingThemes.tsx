
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function TrendingThemes() {
  const { data: trendingThemes, isLoading } = useQuery({
    queryKey: ["trending-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temas_trending")
        .select("*")
        .order("total_tentativas", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Temas em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-2 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trendingThemes?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Temas em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingThemes.map((theme, index) => (
            <motion.div 
              key={index} 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{theme.Tema}</span>
                  <span className="text-xs text-muted-foreground">{theme.Area}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{theme.total_usuarios}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={theme.percentual_acertos} className="h-1 flex-grow" />
                <div className="flex items-center gap-1 text-xs">
                  <Activity className="h-3 w-3 text-primary" />
                  <span>{Math.round(theme.percentual_acertos)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
