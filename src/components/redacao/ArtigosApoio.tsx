
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, FileText, Download, Bookmark, BookmarkPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Artigo {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  created_at: string;
}

interface Modelo {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
}

export const ArtigosApoio = () => {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [selectedArtigo, setSelectedArtigo] = useState<Artigo | null>(null);
  const [selectedModelo, setSelectedModelo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca artigos de redação
        const { data: artigosData, error: artigosError } = await supabase
          .from('redacao_artigos')
          .select('*')
          .order('created_at', { ascending: false });

        if (artigosError) throw artigosError;
        setArtigos(artigosData || []);

        // Busca modelos de documentos
        const { data: modelosData, error: modelosError } = await supabase
          .from('redacao_modelos')
          .select('id, nome, tipo, descricao');

        if (modelosError) throw modelosError;
        setModelos(modelosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Categorias de artigos para filtrar
  const categorias = ["Técnicas de Redação", "Formatação", "Linguagem Jurídica", "Modelos Comentados", "Orientações Gerais"];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="artigos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artigos">Artigos e Guias</TabsTrigger>
          <TabsTrigger value="modelos">Modelos Comentados</TabsTrigger>
        </TabsList>

        <TabsContent value="artigos" className="mt-4">
          <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setArtigos(artigos)}>
              Todos
            </Button>
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant="outline"
                size="sm"
                onClick={() => {
                  const filtered = artigos.filter(a => a.categoria === categoria);
                  setArtigos(filtered);
                }}
              >
                {categoria}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-4/5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {artigos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artigos.map((artigo) => (
                    <Card key={artigo.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{artigo.titulo}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          {artigo.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-muted-foreground">
                          {artigo.conteudo.substring(0, 150)}...
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedArtigo(artigo)}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Ler Artigo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            {selectedArtigo && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>{selectedArtigo.titulo}</DialogTitle>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge>{selectedArtigo.categoria}</Badge>
                                    {selectedArtigo.tags.map((tag) => (
                                      <Badge key={tag} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </DialogHeader>
                                <div className="whitespace-pre-line mt-4">
                                  {selectedArtigo.conteudo.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">{paragraph}</p>
                                  ))}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">
                                    <BookmarkPlus className="mr-2 h-4 w-4" />
                                    Salvar
                                  </Button>
                                  <Button>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                  </Button>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p>Nenhum artigo encontrado nesta categoria.</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="modelos" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-4/5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {modelos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modelos.map((modelo) => (
                    <Card key={modelo.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{modelo.nome}</CardTitle>
                        <Badge>{modelo.tipo}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-muted-foreground">
                          {modelo.descricao}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedModelo(modelo)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Modelo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            {selectedModelo && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>{selectedModelo.nome}</DialogTitle>
                                  <DialogDescription>
                                    {selectedModelo.tipo} - Modelo com comentários
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                                  {/* Aqui mostraria o conteúdo do modelo */}
                                  {selectedModelo.conteudo || "Conteúdo não disponível"}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    Salvar
                                  </Button>
                                  <Button>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </Button>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p>Nenhum modelo disponível.</p>
                  <Button className="mt-4" variant="outline">
                    Carregar exemplos
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
