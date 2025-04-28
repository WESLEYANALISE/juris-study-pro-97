
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Lightbulb, AlertCircle, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

// Categorias de dicas
const CATEGORIAS_DICAS = [
  "Linguagem",
  "Estrutura",
  "Formatação",
  "Revisão",
  "Expressões Úteis"
];

// Dicas pré-definidas
const DICAS_INICIAIS = [
  {
    id: "1",
    titulo: "Objetividade na Linguagem",
    categoria: "Linguagem",
    conteudo: [
      {
        texto: "Prefira frases curtas e diretas. A clareza é fundamental.",
        tipo: "fazer"
      },
      {
        texto: "Evite períodos muito longos com excesso de orações intercaladas.",
        tipo: "evitar"
      },
      {
        texto: "Use vocabulário técnico com precisão, sem exageros.",
        tipo: "fazer"
      }
    ]
  },
  {
    id: "2",
    titulo: "Formatação Padrão",
    categoria: "Formatação",
    conteudo: [
      {
        texto: "Utilize fonte Times New Roman ou Arial, tamanho 12 para o corpo do texto.",
        tipo: "fazer"
      },
      {
        texto: "Mantenha espaçamento entre linhas de 1,5.",
        tipo: "fazer"
      },
      {
        texto: "Evite destaques excessivos (negrito, itálico, sublinhado).",
        tipo: "evitar"
      }
    ]
  },
  {
    id: "3",
    titulo: "Revisão Eficiente",
    categoria: "Revisão",
    conteudo: [
      {
        texto: "Deixe o texto 'descansar' antes da revisão final, quando possível.",
        tipo: "fazer"
      },
      {
        texto: "Confira todas as citações e referências a artigos de lei.",
        tipo: "fazer"
      },
      {
        texto: "Evite revisar apenas na tela. Imprima o documento para uma revisão mais eficaz.",
        tipo: "dica"
      }
    ]
  }
];

export const DicasRedacao = () => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Linguagem");
  const [dicas, setDicas] = useState(DICAS_INICIAIS);
  const [loading, setLoading] = useState(true);
  const [dicasDoDia, setDicasDoDia] = useState<any[]>([]);

  useEffect(() => {
    const fetchDicas = async () => {
      setLoading(true);
      try {
        // Em um cenário real, buscaríamos as dicas do banco
        // Simulando uma busca do banco com um delay
        setTimeout(() => {
          setDicas(DICAS_INICIAIS);
          
          // Seleciona 3 dicas aleatórias para serem as "dicas do dia"
          const dicasAleatorias = [...DICAS_INICIAIS]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
          setDicasDoDia(dicasAleatorias);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dicas:", error);
        setLoading(false);
      }
    };
    
    fetchDicas();
  }, []);

  const dicasFiltradas = dicas.filter(dica => dica.categoria === categoriaSelecionada);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Dicas do Dia</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Confira dicas especiais para melhorar sua redação jurídica hoje
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-4/5" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            dicasDoDia.map((dica) => (
              <Card key={dica.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">{dica.titulo}</CardTitle>
                    <Badge>{dica.categoria}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dica.conteudo.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        {item.tipo === "fazer" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : item.tipo === "evitar" ? (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{item.texto}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-4">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Separator className="my-6" />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Categorias de Dicas</h3>
        
        <Tabs 
          defaultValue={categoriaSelecionada} 
          onValueChange={setCategoriaSelecionada}
          className="space-y-4"
        >
          <TabsList className="flex flex-wrap h-auto gap-2">
            {CATEGORIAS_DICAS.map((categoria) => (
              <TabsTrigger key={categoria} value={categoria}>
                {categoria}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={categoriaSelecionada}>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-4/5" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dicasFiltradas.length > 0 ? (
              <div className="space-y-4">
                {dicasFiltradas.map((dica) => (
                  <Card key={dica.id}>
                    <CardHeader>
                      <CardTitle className="text-md flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        {dica.titulo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {dica.conteudo.map((item: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            {item.tipo === "fazer" ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : item.tipo === "evitar" ? (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            )}
                            <span>{item.texto}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p>Nenhuma dica encontrada para esta categoria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
