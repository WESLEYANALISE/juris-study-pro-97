import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Volume } from "lucide-react";

const mockArticles = [
  {
    id: 1,
    title: "As recentes mudanças no Código de Processo Civil",
    category: "Legislação",
    author: "Dr. Paulo Rodrigues",
    date: "20 de Abril, 2025",
    summary: "Análise das alterações mais significativas no CPC e seus impactos na prática jurídica.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
    source: "Jus Brasil"
  },
  {
    id: 2,
    title: "Concurso para Defensoria Pública: o que esperar em 2025",
    category: "Concursos",
    author: "Ana Clara Martins",
    date: "18 de Abril, 2025",
    summary: "Guia completo com novidades, disciplinas mais cobradas e estratégias de estudo.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070",
    source: "Estratégia Concursos"
  },
  {
    id: 3,
    title: "Decisão do STF sobre tributação de heranças gera polêmica",
    category: "Jurisprudência",
    author: "Dr. Carlos Mendes",
    date: "15 de Abril, 2025",
    summary: "Análise do julgamento do recurso extraordinário que fixou nova tese sobre ITCMD.",
    imageUrl: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=2080",
    source: "Consultor Jurídico"
  },
  {
    id: 4,
    title: "IA e Direito: como a inteligência artificial está transformando a advocacia",
    category: "Tecnologia",
    author: "Dra. Roberta Campos",
    date: "12 de Abril, 2025",
    summary: "Ferramentas, aplicações práticas e desafios éticos do uso de IA no mundo jurídico.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad662?q=80&w=2070",
    source: "Migalhas"
  },
  {
    id: 5,
    title: "Nova Lei de Licitações: guia prático para gestores públicos",
    category: "Administrativo",
    author: "Dr. Fernando Oliveira",
    date: "10 de Abril, 2025",
    summary: "Orientações práticas sobre as principais mudanças e como implementá-las corretamente.",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070",
    source: "CONJUR"
  }
];

const categories = [
  "Todos", "Legislação", "Concursos", "Jurisprudência", "Tecnologia", "Administrativo", "Notícias"
];

const sources = [
  "Todos", "Jus Brasil", "Consultor Jurídico", "Migalhas", "Conjur", "Estratégia Concursos"
];

const Bloger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);

  useEffect(() => {
    let result = mockArticles;
    
    if (searchTerm) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeCategory !== "Todos") {
      result = result.filter(article => article.category === activeCategory);
    }
    
    setFilteredArticles(result);
  }, [searchTerm, activeCategory]);

  const narrarTexto = (texto: string) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bloger Jurídico</h1>
        <p className="text-muted-foreground">
          Artigos, notícias e publicações sobre Direito, concursos e jurisprudência
        </p>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar artigos, temas ou autores..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="categorias" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="fontes">Por Fonte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categorias" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button 
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="fontes" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sources.map(source => (
              <Button 
                key={source}
                variant="outline"
                size="sm"
              >
                {source}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map(article => (
          <Card key={article.id} className="overflow-hidden">
            <div 
              className="h-48 w-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${article.imageUrl})` }}
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {article.category} • {article.source}
                  </div>
                  <CardTitle>{article.title}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => narrarTexto(`${article.title}. ${article.summary}`)}
                >
                  <Volume className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>{article.date} • Por {article.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{article.summary}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Ler artigo completo
              </Button>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum artigo encontrado com os filtros atuais.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("Todos");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button variant="outline">Carregar mais artigos</Button>
      </div>
    </div>
  );
};

export default Bloger;
