
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Brain, FileText, BookOpen, Search, Plus, Bookmark } from "lucide-react";

const Resumos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dados de exemplo para resumos
  const resumosData = [
    {
      id: 1,
      title: "Direito Constitucional: Princípios Fundamentais",
      author: "Prof. Paulo Silva",
      date: "15/04/2025",
      excerpt: "Resumo sobre os princípios fundamentais da Constituição Federal de 1988, incluindo fundamentos, objetivos e princípios nas relações internacionais.",
      pages: 12,
      downloads: 345
    },
    {
      id: 2,
      title: "Direito Civil: Parte Geral",
      author: "Profa. Maria Sousa",
      date: "10/04/2025",
      excerpt: "Abrange personalidade, capacidade, pessoas naturais e jurídicas, bens, fatos e negócios jurídicos, prescrição e decadência.",
      pages: 18,
      downloads: 289
    },
    {
      id: 3,
      title: "Direito Administrativo: Atos Administrativos",
      author: "Prof. Carlos Mendes",
      date: "08/04/2025",
      excerpt: "Conceito, requisitos, atributos, classificação, espécies, invalidação, convalidação e revogação dos atos administrativos.",
      pages: 15,
      downloads: 210
    },
    {
      id: 4,
      title: "Direito Penal: Teoria do Crime",
      author: "Prof. André Santos",
      date: "05/04/2025",
      excerpt: "Análise da teoria do crime, tipicidade, ilicitude, culpabilidade e punibilidade, com exemplos práticos e jurisprudências.",
      pages: 20,
      downloads: 278
    }
  ];

  const filteredResumos = resumosData.filter(resumo => 
    resumo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resumo.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Brain className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Resumos Jurídicos</h1>
          <p className="text-muted-foreground text-center">
            Acesse e crie resumos para otimizar seus estudos
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar resumos por tema, matéria ou conteúdo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex gap-2">
          <Plus className="h-4 w-4" />
          Novo Resumo
        </Button>
      </div>

      <Tabs defaultValue="todos" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="meus">Meus Resumos</TabsTrigger>
          <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
          <TabsTrigger value="recentes">Recentes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumos.map(resumo => (
          <Card key={resumo.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{resumo.title}</CardTitle>
              <CardDescription>{resumo.author} • {resumo.date}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{resumo.excerpt}</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {resumo.pages} páginas
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {resumo.downloads} acessos
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">Visualizar</Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredResumos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum resumo encontrado com os critérios atuais.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setSearchTerm("")}
          >
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  );
};

export default Resumos;
