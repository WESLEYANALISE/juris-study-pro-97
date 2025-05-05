
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Award, Brain, CheckCircle, BookMarked, AlertCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PerfilEvolucaoProps {
  stats?: {
    questoesRespondidas?: number;
    questoesCorretas?: number;
    flashcardsRevisados?: number;
    tempoEstudoTotal?: number;
  } | null;
  isLoading?: boolean;
}

export const PerfilEvolucao = ({ stats, isLoading = false }: PerfilEvolucaoProps) => {
  // Create placeholder stats if no real data available
  const displayStats = stats || {
    questoesRespondidas: 0,
    questoesCorretas: 0,
    flashcardsRevisados: 0,
    tempoEstudoTotal: 0
  };
  
  // Calculate percentages and derived stats
  const questoesAcertos = displayStats.questoesRespondidas 
    ? Math.round((displayStats.questoesCorretas || 0) / displayStats.questoesRespondidas * 100) 
    : 0;
    
  const tempoEstudoHoras = (displayStats.tempoEstudoTotal || 0) / 60;
  
  // Calculated stages based on stats
  const nivelAtual = determineNivel(displayStats);
  
  // Determine user level based on stats
  function determineNivel(userStats: any) {
    const { questoesRespondidas, flashcardsRevisados, tempoEstudoTotal } = userStats;
    const totalPoints = (questoesRespondidas || 0) * 5 + 
                        (flashcardsRevisados || 0) * 3 + 
                        (tempoEstudoTotal || 0) / 10;
    
    if (totalPoints >= 500) return { nivel: 'Avançado', progresso: 75 };
    if (totalPoints >= 200) return { nivel: 'Intermediário', progresso: 40 };
    return { nivel: 'Iniciante', progresso: 15 };
  }
  
  // Generate last 7 days of activity for the chart (in real app, this would come from the database)
  const generateActivityData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      // Generate realistic random data based on user level
      const multiplier = nivelAtual.nivel === 'Avançado' ? 3 : 
                         nivelAtual.nivel === 'Intermediário' ? 2 : 1;
      
      // Generate fewer entries for weekends to make it more realistic
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const activityFactor = isWeekend ? 0.5 : 1;
      
      data.push({
        name: format(date, 'dd/MM', { locale: ptBR }),
        questoes: Math.floor(Math.random() * 8 * multiplier * activityFactor),
        flashcards: Math.floor(Math.random() * 12 * multiplier * activityFactor),
        tempo: Math.floor(Math.random() * 60 * multiplier * activityFactor)
      });
    }
    return data;
  };
  
  const activityData = generateActivityData();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Perfil de Evolução</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso nos estudos jurídicos e veja seu desenvolvimento ao longo do tempo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Tempo de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {tempoEstudoHoras.toFixed(1)}h
            </div>
            <p className="text-sm text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Questões Respondidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {displayStats.questoesRespondidas || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {questoesAcertos}% de acertos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Flashcards Revisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {displayStats.flashcardsRevisados || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.floor((displayStats.flashcardsRevisados || 0) * 0.7)} dominados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Nível de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Iniciante</span>
            <span>Intermediário</span>
            <span>Avançado</span>
          </div>
          <Progress value={nivelAtual.progresso} className="h-3" />
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <h4 className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Seu nível atual: {nivelAtual.nivel}
            </h4>
            <p className="text-sm text-muted-foreground">
              {nivelAtual.nivel === 'Iniciante' && 
                "Você está começando bem! Continue praticando com questões básicas e flashcards para formar sua base de conhecimento."}
              {nivelAtual.nivel === 'Intermediário' && 
                "Bom progresso! Você já tem uma base sólida. Experimente temas mais complexos e aumente seu tempo de estudo."}
              {nivelAtual.nivel === 'Avançado' && 
                "Excelente! Você tem demonstrado consistência nos estudos. Considere se aprofundar em áreas específicas do Direito."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Atividades nos últimos 7 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="questoes" 
                  name="Questões" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="flashcards" 
                  name="Flashcards" 
                  stroke="#82ca9d" 
                />
                <Line 
                  type="monotone" 
                  dataKey="tempo" 
                  name="Minutos estudados" 
                  stroke="#ffc658" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {nivelAtual.nivel === 'Iniciante' && (
        <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <h4 className="font-medium mb-1">Recomendação para Iniciantes</h4>
          <p className="text-sm text-muted-foreground">
            Para avançar mais rapidamente, tente responder pelo menos 10 questões por dia e revisar seus flashcards regularmente.
            Comece com a trilha básica de estudos e vá progredindo conforme dominar os conceitos.
          </p>
        </div>
      )}
    </div>
  );
};
