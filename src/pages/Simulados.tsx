
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladoCategoria } from "@/types/simulados";
import { useAuth } from "@/hooks/use-auth";
import { SimuladoDashboard } from "@/components/simulados/SimuladoDashboard";
import { SimuladoSetup } from "@/components/simulados/SimuladoSetup";

const Simulados = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<SimuladoCategoria>("OAB");

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulados</h1>
          <p className="text-muted-foreground">
            Pratique com questões de diversos concursos e exames
          </p>
        </div>
        <Button onClick={() => navigate("/simulados/novo")}>
          Iniciar Novo Simulado
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="novo">Novo Simulado</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Seu Desempenho</CardTitle>
              <CardDescription>
                Acompanhe suas estatísticas e progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimuladoDashboard categoria={selectedCategory} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="novo">
          <SimuladoSetup onStart={(config) => navigate("/simulados/sessao/nova", { state: config })} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulados;
