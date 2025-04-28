
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { Separator } from "@/components/ui/separator";
import { VideoAulasRedacao } from "@/components/redacao/VideoAulasRedacao";
import { ArtigosApoio } from "@/components/redacao/ArtigosApoio";
import { DicasRedacao } from "@/components/redacao/DicasRedacao";
import { ExerciciosPraticos } from "@/components/redacao/ExerciciosPraticos";
import { FerramentasApoio } from "@/components/redacao/FerramentasApoio";
import { ComunidadeRedacao } from "@/components/redacao/ComunidadeRedacao";
import { GamificacaoRedacao } from "@/components/redacao/GamificacaoRedacao";

const RedacaoJuridica = () => {
  const [activeTab, setActiveTab] = useState("videoaulas");

  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Redação Jurídica</h1>
            <p className="text-muted-foreground">
              Aprenda a elaborar textos jurídicos com técnica, clareza e precisão
            </p>
          </div>

          <Separator />

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-auto">
              <TabsList className="mb-4">
                <TabsTrigger value="videoaulas">Aulas Teóricas</TabsTrigger>
                <TabsTrigger value="artigos">Artigos e Materiais</TabsTrigger>
                <TabsTrigger value="dicas">Dicas Rápidas</TabsTrigger>
                <TabsTrigger value="exercicios">Exercícios Práticos</TabsTrigger>
                <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
                <TabsTrigger value="comunidade">Comunidade</TabsTrigger>
                <TabsTrigger value="gamificacao">Conquistas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="videoaulas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aulas Teóricas</CardTitle>
                  <CardDescription>
                    Videoaulas sobre técnicas de redação jurídica, estruturação de textos e formatação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoAulasRedacao />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artigos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Artigos e Materiais de Apoio</CardTitle>
                  <CardDescription>
                    Conteúdo teórico, modelos comentados e exemplos práticos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArtigosApoio />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dicas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dicas Rápidas de Redação</CardTitle>
                  <CardDescription>
                    Orientações práticas para aprimorar seus textos jurídicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DicasRedacao />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercicios" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exercícios Práticos</CardTitle>
                  <CardDescription>
                    Pratique suas habilidades de redação com exercícios e receba feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExerciciosPraticos />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ferramentas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ferramentas de Apoio</CardTitle>
                  <CardDescription>
                    Recursos para auxiliar na produção de textos jurídicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FerramentasApoio />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comunidade" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comunidade</CardTitle>
                  <CardDescription>
                    Compartilhe textos, faça perguntas e interaja com outros usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComunidadeRedacao />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gamificacao" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conquistas e Progresso</CardTitle>
                  <CardDescription>
                    Acompanhe sua evolução e ganhe recompensas por suas atividades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GamificacaoRedacao />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default RedacaoJuridica;
