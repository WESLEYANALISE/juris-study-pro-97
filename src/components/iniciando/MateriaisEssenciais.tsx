
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export const MateriaisEssenciais = () => {
  const livros = [
    {
      id: 1,
      titulo: "Curso de Direito Constitucional Esquematizado",
      autor: "Pedro Lenza",
      tipo: "Livro Impresso/Digital",
      nivel: "Iniciante",
      area: "Constitucional",
      descricao: "Uma abordagem didática e esquematizada do Direito Constitucional, ideal para iniciantes.",
      link: "#"
    },
    {
      id: 2,
      titulo: "Manual de Direito Civil",
      autor: "Flávio Tartuce",
      tipo: "Livro Impresso/Digital",
      nivel: "Iniciante",
      area: "Civil",
      descricao: "Apresentação clara e objetiva dos principais institutos do Direito Civil brasileiro.",
      link: "#"
    },
    {
      id: 3,
      titulo: "Curso de Direito Penal",
      autor: "Rogério Greco",
      tipo: "Livro Impresso/Digital",
      nivel: "Iniciante/Intermediário",
      area: "Penal",
      descricao: "Abordagem completa da parte geral do Direito Penal com linguagem acessível.",
      link: "#"
    }
  ];

  const apostilas = [
    {
      id: 101,
      titulo: "Noções de Direito Constitucional",
      autor: "JurisStudy",
      tipo: "Apostila Digital",
      nivel: "Iniciante",
      area: "Constitucional",
      descricao: "Material introdutório com os conceitos fundamentais do direito constitucional.",
      link: "#"
    },
    {
      id: 102,
      titulo: "Introdução ao Direito Civil",
      autor: "JurisStudy",
      tipo: "Apostila Digital",
      nivel: "Iniciante",
      area: "Civil",
      descricao: "Apostila com os princípios e conceitos básicos do direito civil.",
      link: "#"
    },
    {
      id: 103,
      titulo: "Guia de Leitura da Constituição",
      autor: "JurisStudy",
      tipo: "Guia Prático",
      nivel: "Iniciante",
      area: "Constitucional",
      descricao: "Guia para facilitar a interpretação e leitura da Constituição Federal.",
      link: "#"
    }
  ];

  const sites = [
    {
      id: 201,
      titulo: "Planalto - Legislação",
      tipo: "Site Governamental",
      nivel: "Todos os níveis",
      area: "Geral",
      descricao: "Portal oficial com toda a legislação federal brasileira atualizada.",
      link: "http://www4.planalto.gov.br/legislacao/"
    },
    {
      id: 202,
      titulo: "STF - Jurisprudência",
      tipo: "Site Governamental",
      nivel: "Todos os níveis",
      area: "Jurisprudência",
      descricao: "Base de decisões e jurisprudência do Supremo Tribunal Federal.",
      link: "https://jurisprudencia.stf.jus.br/"
    },
    {
      id: 203,
      titulo: "Âmbito Jurídico",
      tipo: "Site de Artigos",
      nivel: "Iniciante/Intermediário",
      area: "Diversos",
      descricao: "Portal com artigos jurídicos sobre diversos temas em linguagem acessível.",
      link: "https://ambitojuridico.com.br/"
    }
  ];

  const renderCard = (item: any, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">
              {item.area}
            </Badge>
            <Badge variant="secondary">{item.nivel}</Badge>
          </div>
          <CardTitle className="text-base">{item.titulo}</CardTitle>
          {item.autor && (
            <div className="text-sm text-muted-foreground">
              Autor: {item.autor}
            </div>
          )}
          <div className="text-xs flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{item.tipo}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          <p className="text-sm text-muted-foreground">{item.descricao}</p>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(item.link, "_blank")}
          >
            {item.tipo.includes('Digital') || item.tipo === 'Apostila Digital' || item.tipo === 'Guia Prático' ? (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Baixar
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Materiais Essenciais</h2>
        <p className="text-muted-foreground">
          Recursos indispensáveis para quem está iniciando os estudos em Direito.
        </p>
      </div>

      <Tabs defaultValue="livros" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="livros">Livros</TabsTrigger>
          <TabsTrigger value="apostilas">Apostilas e Resumos</TabsTrigger>
          <TabsTrigger value="sites">Sites Recomendados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="livros">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {livros.map((livro, idx) => renderCard(livro, idx))}
          </div>
        </TabsContent>
        
        <TabsContent value="apostilas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {apostilas.map((apostila, idx) => renderCard(apostila, idx))}
          </div>
        </TabsContent>
        
        <TabsContent value="sites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {sites.map((site, idx) => renderCard(site, idx))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-card p-4 rounded-md border border-border mt-6">
        <h4 className="font-medium mb-2">Dica de estudo</h4>
        <p className="text-sm text-muted-foreground">
          Comece com os materiais marcados como "Iniciante" e avance gradualmente. 
          Combine a leitura de livros e apostilas com a prática de questões para fixar o conhecimento.
        </p>
      </div>
    </div>
  );
};
