
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Search, Calendar, BookOpen, ExternalLink, Share2 } from "lucide-react";

const Noticias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dados de exemplo para notícias
  const noticiasData = [
    {
      id: 1,
      title: "STF decide sobre constitucionalidade da Lei de Improbidade Administrativa",
      source: "Supremo Tribunal Federal",
      category: "Jurisprudência",
      date: "20/04/2025",
      excerpt: "Em julgamento histórico, o Supremo Tribunal Federal decidiu sobre a constitucionalidade das alterações realizadas na Lei de Improbidade Administrativa pela Lei nº 14.230/2021.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
      tags: ["STF", "Improbidade", "Constitucional"]
    },
    {
      id: 2,
      title: "CNJ publica nova resolução sobre audiências virtuais no pós-pandemia",
      source: "Conselho Nacional de Justiça",
      category: "Legislação",
      date: "19/04/2025",
      excerpt: "O Conselho Nacional de Justiça publicou nova resolução que regulamenta a realização de audiências virtuais no cenário pós-pandemia, estabelecendo diretrizes permanentes.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070",
      tags: ["CNJ", "Audiências", "Virtual"]
    },
    {
      id: 3,
      title: "Aprovado projeto de lei que altera regras do processo trabalhista",
      source: "Câmara dos Deputados",
      category: "Legislativo",
      date: "18/04/2025",
      excerpt: "A Câmara dos Deputados aprovou projeto de lei que altera diversos dispositivos da Consolidação das Leis do Trabalho (CLT) relativos ao processo do trabalho.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
      tags: ["Trabalhista", "CLT", "Reforma"]
    },
    {
      id: 4,
      title: "OAB manifesta preocupação com PEC que limita decisões monocráticas",
      source: "Ordem dos Advogados do Brasil",
      category: "Institucional",
      date: "17/04/2025",
      excerpt: "A Ordem dos Advogados do Brasil manifestou preocupação com a Proposta de Emenda Constitucional que limita as decisões monocráticas dos ministros do STF.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?q=80&w=2071",
      tags: ["OAB", "PEC", "STF"]
    },
    {
      id: 5,
      title: "STJ firma tese sobre prazo prescricional em ações de responsabilidade civil",
      source: "Superior Tribunal de Justiça",
      category: "Jurisprudência",
      date: "16/04/2025",
      excerpt: "Em julgamento sob o rito dos recursos repetitivos, o Superior Tribunal de Justiça fixou tese sobre o prazo prescricional aplicável às ações de responsabilidade civil.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070",
      tags: ["STJ", "Prescrição", "Civil"]
    },
    {
      id: 6,
      title: "Sancionada lei que altera o Código Penal em crimes contra a administração pública",
      source: "Presidência da República",
      category: "Legislação",
      date: "15/04/2025",
      excerpt: "O Presidente da República sancionou lei que altera o Código Penal, tornando mais rigorosas as penas para crimes contra a administração pública.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=2069",
      tags: ["Penal", "Corrupção", "Lei"]
    }
  ];

  const filteredNoticias = noticiasData.filter(noticia => 
    noticia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    noticia.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    noticia.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categorias para filtro
  const categorias = ["Todas", "Jurisprudência", "Legislação", "Legislativo", "Institucional", "Concursos"];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Newspaper className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Notícias Jurídicas</h1>
          <p className="text-muted-foreground text-center">
            Acompanhe as principais novidades do mundo jurídico
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar notícias, temas, tribunais ou palavras-chave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="todas" className="mb-6">
        <TabsList className="mb-4">
          {categorias.map(categoria => (
            <TabsTrigger key={categoria} value={categoria.toLowerCase()}>
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNoticias.map(noticia => (
          <Card key={noticia.id} className="overflow-hidden">
            <div 
              className="h-40 w-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${noticia.imageUrl})` }}
            />
            <CardHeader>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{noticia.category}</Badge>
                <Badge variant="secondary" className="text-xs">{noticia.source}</Badge>
              </div>
              <CardTitle className="line-clamp-2">{noticia.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {noticia.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{noticia.excerpt}</p>
              <div className="flex flex-wrap gap-1">
                {noticia.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Ler mais
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredNoticias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma notícia encontrada com os critérios atuais.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setSearchTerm("")}
          >
            Limpar busca
          </Button>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button variant="outline">Carregar mais notícias</Button>
      </div>
    </div>
  );
};

export default Noticias;
