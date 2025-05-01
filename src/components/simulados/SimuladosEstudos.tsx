
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladoCategoria } from "@/types/simulados";
import { Book, BookOpen, Video, Check, FileText, Bookmark, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SimuladosEstudosProps {
  categoria: SimuladoCategoria;
}

interface Material {
  id: string;
  title: string;
  type: 'book' | 'video' | 'article' | 'summary';
  url: string;
  author?: string;
  level?: 'básico' | 'intermediário' | 'avançado';
  duration?: string;
  area?: string;
}

export const SimuladosEstudos = ({ categoria }: SimuladosEstudosProps) => {
  const [loading, setLoading] = useState(true);
  const [materiais, setMateriais] = useState<Material[]>([]);

  useEffect(() => {
    // Simulate API call to fetch study materials
    setTimeout(() => {
      // Materials based on the category
      const materials: Material[] = [
        {
          id: '1',
          title: 'Direito Civil: Parte Geral',
          type: 'book',
          author: 'Maria Helena Diniz',
          url: '#',
          level: 'intermediário',
          area: 'Direito Civil'
        },
        {
          id: '2',
          title: 'Princípios Constitucionais',
          type: 'video',
          author: 'Prof. Alexandre Santos',
          url: '#',
          duration: '45 min',
          level: 'básico',
          area: 'Direito Constitucional'
        },
        {
          id: '3',
          title: 'Resumo Direito Penal',
          type: 'summary',
          url: '#',
          level: 'básico',
          area: 'Direito Penal'
        },
        {
          id: '4',
          title: 'Artigo: Atualidades em Direito Administrativo',
          type: 'article',
          author: 'Prof. Maria Silva',
          url: '#',
          level: 'avançado',
          area: 'Direito Administrativo'
        }
      ];
      
      setMateriais(materials);
      setLoading(false);
    }, 1500);
  }, [categoria]);
  
  const renderIcon = (type: string) => {
    switch(type) {
      case 'book': return <BookOpen className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'summary': return <Check className="h-4 w-4" />;
      default: return <Book className="h-4 w-4" />;
    }
  };
  
  const getLevelColor = (level?: string) => {
    switch(level) {
      case 'básico': return 'bg-green-500/20 text-green-600 border-green-200';
      case 'intermediário': return 'bg-amber-500/20 text-amber-600 border-amber-200';
      case 'avançado': return 'bg-red-500/20 text-red-600 border-red-200';
      default: return 'bg-blue-500/20 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Materiais de Estudo</CardTitle>
          <CardDescription>
            Conteúdo selecionado para sua preparação em {categoria}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="books">Livros</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
              <TabsTrigger value="articles">Artigos</TabsTrigger>
              <TabsTrigger value="summaries">Resumos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {materiais.map((material) => (
                    <Card key={material.id} className="bg-card/60 hover:bg-accent/20 transition-all">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              {renderIcon(material.type)}
                            </div>
                            <h3 className="font-medium">{material.title}</h3>
                            <Badge variant="outline" className={getLevelColor(material.level)}>
                              {material.level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {material.author && <span>{material.author}</span>}
                            {material.duration && <span>{material.duration}</span>}
                            {material.area && <span>{material.area}</span>}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-muted-foreground">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" /> Acessar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="books" className="mt-4">
              {loading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="space-y-3">
                  {materiais
                    .filter(m => m.type === 'book')
                    .map((material) => (
                      <Card key={material.id} className="bg-card/60 hover:bg-accent/20 transition-all">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-primary/10">
                                {renderIcon(material.type)}
                              </div>
                              <h3 className="font-medium">{material.title}</h3>
                              <Badge variant="outline" className={getLevelColor(material.level)}>
                                {material.level}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {material.author && <span>{material.author}</span>}
                              {material.area && <span>{material.area}</span>}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-muted-foreground">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-1" /> Acessar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
            
            {/* Similar content for other tabs (videos, articles, summaries) would be included here */}
            <TabsContent value="videos" className="mt-4">
              {/* Content for videos tab */}
              {loading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="space-y-3">
                  {materiais
                    .filter(m => m.type === 'video')
                    .length > 0 ? (
                    materiais
                      .filter(m => m.type === 'video')
                      .map((material) => (
                        <Card key={material.id} className="bg-card/60 hover:bg-accent/20 transition-all">
                          <CardContent className="p-4 flex justify-between items-center">
                            {/* Same structure as above */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                  {renderIcon(material.type)}
                                </div>
                                <h3 className="font-medium">{material.title}</h3>
                                <Badge variant="outline" className={getLevelColor(material.level)}>
                                  {material.level}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {material.author && <span>{material.author}</span>}
                                {material.duration && <span>{material.duration}</span>}
                                {material.area && <span>{material.area}</span>}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-muted-foreground">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 mr-1" /> Assistir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      Nenhum vídeo disponível para esta categoria.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Articles tab */}
            <TabsContent value="articles" className="mt-4">
              {loading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="space-y-3">
                  {materiais
                    .filter(m => m.type === 'article')
                    .length > 0 ? (
                    materiais
                      .filter(m => m.type === 'article')
                      .map((material) => (
                        <Card key={material.id} className="bg-card/60 hover:bg-accent/20 transition-all">
                          {/* Same content structure */}
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                  {renderIcon(material.type)}
                                </div>
                                <h3 className="font-medium">{material.title}</h3>
                                <Badge variant="outline" className={getLevelColor(material.level)}>
                                  {material.level}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {material.author && <span>{material.author}</span>}
                                {material.area && <span>{material.area}</span>}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-muted-foreground">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 mr-1" /> Ler
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      Nenhum artigo disponível para esta categoria.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Summaries tab */}
            <TabsContent value="summaries" className="mt-4">
              {loading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="space-y-3">
                  {materiais
                    .filter(m => m.type === 'summary')
                    .length > 0 ? (
                    materiais
                      .filter(m => m.type === 'summary')
                      .map((material) => (
                        <Card key={material.id} className="bg-card/60 hover:bg-accent/20 transition-all">
                          {/* Same content structure */}
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                  {renderIcon(material.type)}
                                </div>
                                <h3 className="font-medium">{material.title}</h3>
                                <Badge variant="outline" className={getLevelColor(material.level)}>
                                  {material.level}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {material.author && <span>{material.author}</span>}
                                {material.area && <span>{material.area}</span>}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-muted-foreground">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 mr-1" /> Acessar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      Nenhum resumo disponível para esta categoria.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Plano de Estudos</CardTitle>
          <CardDescription>
            Esquema personalizado para sua aprovação em {categoria}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center border-2 border-dashed rounded-lg">
            <h3 className="font-medium mb-2">Plano de Estudos Personalizado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Otimize seus estudos com um plano baseado no seu desempenho e nas estatísticas das provas.
            </p>
            <Button>Gerar Plano de Estudos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
