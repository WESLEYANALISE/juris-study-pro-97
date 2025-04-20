
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Clock, CheckCircle, XCircle, BarChart as BarChartIcon } from "lucide-react";

const FlashcardStats = () => {
  // Mock data for demonstration
  const studyData = [
    { name: "Direito Civil", estudados: 42, acertos: 35, erros: 7 },
    { name: "Direito Penal", estudados: 28, acertos: 20, erros: 8 },
    { name: "Direito Constitucional", estudados: 56, acertos: 48, erros: 8 },
    { name: "Direito Administrativo", estudados: 35, acertos: 26, erros: 9 },
    { name: "Direito Tributário", estudados: 21, acertos: 15, erros: 6 },
  ];

  const timeData = [
    { name: "Direito Civil", tempo: 2.5 },
    { name: "Direito Penal", tempo: 3.2 },
    { name: "Direito Constitucional", tempo: 1.8 },
    { name: "Direito Administrativo", tempo: 2.1 },
    { name: "Direito Tributário", tempo: 3.5 },
  ];

  const pieData = [
    { name: "Direito Civil", value: 42 },
    { name: "Direito Penal", value: 28 },
    { name: "Direito Constitucional", value: 56 },
    { name: "Direito Administrativo", value: 35 },
    { name: "Direito Tributário", value: 21 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  const totalCards = studyData.reduce((sum, item) => sum + item.estudados, 0);
  const totalAcertos = studyData.reduce((sum, item) => sum + item.acertos, 0);
  const totalErros = studyData.reduce((sum, item) => sum + item.erros, 0);
  const mediaTempo = timeData.reduce((sum, item) => sum + item.tempo, 0) / timeData.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Estudados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{totalCards}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">flashcards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">
                {totalCards > 0 ? Math.round((totalAcertos / totalCards) * 100) : 0}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">({totalAcertos} acertos)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold">
                {totalCards > 0 ? Math.round((totalErros / totalCards) * 100) : 0}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">({totalErros} erros)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{mediaTempo.toFixed(1)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">minutos por sessão</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="estudados">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="estudados">Cards por Área</TabsTrigger>
          <TabsTrigger value="tempo">Tempo de Estudo</TabsTrigger>
        </TabsList>

        <TabsContent value="estudados">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Área</CardTitle>
              <CardDescription>
                Quantidade de flashcards estudados e sua taxa de acerto em cada área
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={studyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="acertos" stackId="a" fill="#82ca9d" name="Acertos" />
                  <Bar dataKey="erros" stackId="a" fill="#ff8042" name="Erros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tempo">
          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio por Área</CardTitle>
              <CardDescription>
                Tempo médio gasto em cada área (minutos por card)
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={timeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tempo" fill="#8884d8" name="Tempo (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Estudos</CardTitle>
          <CardDescription>
            Áreas mais estudadas baseadas no número de flashcards
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[350px]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="w-full md:w-3/5 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-2/5 mt-4 md:mt-0 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}:</span>
                  <span className="text-sm font-medium ml-auto">{entry.value} cards</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardStats;
