
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSimulado } from "@/hooks/use-simulado";
import type { SimuladoCategoria } from "@/types/simulados";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SimuladoDashboardProps {
  categoria: SimuladoCategoria;
}

export const SimuladoDashboard = ({ categoria }: SimuladoDashboardProps) => {
  const { useEstatisticas, useLeaderboard } = useSimulado(categoria);
  const { data: estatisticas } = useEstatisticas();
  const { data: leaderboard } = useLeaderboard();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Questões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.[0]?.total_respondidas ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Acerto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.[0]?.percentual.toFixed(1)}%
            </div>
            <Progress
              value={estatisticas?.[0]?.percentual ?? 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard?.map((user, index) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">#{index + 1}</span>
                  <div>
                    <p className="font-medium">Usuário {user.user_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.total_respondidas} questões
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {user.percentual.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
