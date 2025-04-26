import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Share2Icon, Newspaper, SearchIcon, Calendar, User, Tag, Info, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { motion } from "framer-motion";
interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  category: string;
  date: string;
  author: string;
  image: string;
  tags: string[];
  url: string;
}
const Noticias = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const mockNews: NewsItem[] = [{
    id: "1",
    title: "STF decide sobre constitucionalidade da Lei de Responsabilidade Fiscal",
    description: "O Supremo Tribunal Federal decidiu hoje sobre a constitucionalidade de dispositivos da Lei de Responsabilidade Fiscal que estavam sendo questionados.",
    content: "Em sessão virtual encerrada nesta sexta-feira (26), o Supremo Tribunal Federal (STF) decidiu que estados e municípios não podem editar normas que dificultem o pagamento de precatórios. O tema foi analisado na Ação Direta de Inconstitucionalidade (ADI) 4425. A maioria dos ministros entendeu que os precatórios são uma forma de execução de decisão judicial contra a Fazenda Pública e que sua quitação é obrigatória...",
    source: "STF",
    category: "Constitucional",
    date: "2025-04-26",
    author: "Redação JurisNews",
    image: "https://source.unsplash.com/random/800x600/?court",
    tags: ["STF", "Constitucional", "LRF"],
    url: "#"
  }, {
    id: "2",
    title: "Conselho Nacional de Justiça aprova novas diretrizes para conciliação",
    description: "O CNJ aprovou hoje novas diretrizes para conciliação e mediação nos tribunais brasileiros, buscando ampliar os métodos alternativos de resolução de conflitos.",
    content: "O Conselho Nacional de Justiça (CNJ) aprovou nesta terça-feira novas diretrizes para os procedimentos de conciliação e mediação nos tribunais brasileiros. As mudanças visam padronizar as práticas e ampliar os métodos alternativos de resolução de conflitos no país...",
    source: "CNJ",
    category: "Processual",
    date: "2025-04-25",
    author: "Maria Silva",
    image: "https://source.unsplash.com/random/800x600/?agreement",
    tags: ["CNJ", "Conciliação", "Mediação"],
    url: "#"
  }, {
    id: "3",
    title: "Nova lei altera regras para registro de imóveis no Brasil",
    description: "O presidente sancionou hoje uma nova lei que altera regras para registro de imóveis, simplificando procedimentos e reduzindo custos.",
    content: "Foi sancionada nesta semana a Lei 14.382/22, que simplifica o registro de imóveis no Brasil. A norma altera a Lei de Registros Públicos (Lei 6.015/73) e traz diversas mudanças que visam desburocratizar os atos cartorários, além de permitir a realização de procedimentos por meio eletrônico...",
    source: "Governo Federal",
    category: "Civil",
    date: "2025-04-24",
    author: "João Santos",
    image: "https://source.unsplash.com/random/800x600/?realestate",
    tags: ["Imóveis", "Registro", "Civil"],
    url: "#"
  }, {
    id: "4",
    title: "Superior Tribunal de Justiça define tese sobre contratos de planos de saúde",
    description: "O STJ definiu hoje importante tese sobre a aplicação do Código de Defesa do Consumidor em contratos de planos de saúde coletivos.",
    content: "A Segunda Seção do Superior Tribunal de Justiça (STJ) definiu, em julgamento sob o rito dos recursos repetitivos, que o Código de Defesa do Consumidor (CDC) é aplicável aos contratos de planos de saúde coletivos. A decisão, que afetará milhares de processos sobrestados em todo o país, estabelece que as cláusulas desses contratos estão sujeitas ao controle de abusividade...",
    source: "STJ",
    category: "Consumidor",
    date: "2025-04-23",
    author: "Ana Oliveira",
    image: "https://source.unsplash.com/random/800x600/?health",
    tags: ["STJ", "Plano de Saúde", "Consumidor"],
    url: "#"
  }, {
    id: "5",
    title: "Tribunal Superior do Trabalho define nova súmula sobre horas extras",
    description: "O TST publicou nova súmula que consolida o entendimento sobre pagamento de horas extras para trabalhadores em regime de teletrabalho.",
    content: "O Tribunal Superior do Trabalho (TST) publicou nesta segunda-feira a Súmula 464, que consolida o entendimento da corte sobre o pagamento de horas extras para trabalhadores em regime de teletrabalho. Segundo o novo enunciado, 'são devidas horas extras ao empregado em teletrabalho quando comprovado o controle da jornada pelo empregador, direta ou indiretamente'...",
    source: "TST",
    category: "Trabalho",
    date: "2025-04-22",
    author: "Marcos Pereira",
    image: "https://source.unsplash.com/random/800x600/?work",
    tags: ["TST", "Horas Extras", "Teletrabalho"],
    url: "#"
  }];
  useEffect(() => {
    // Simulando carregamento de notícias
    const timer = setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const handleGenerateSummary = async (article: NewsItem) => {
    setSelectedArticle(article);
    setSummaryLoading(true);
    try {
      // Simulating API call to Gemini
      const summaryText = await generateSummaryWithGemini(article.content);
      setSummary(summaryText);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Não foi possível gerar o resumo. Tente novamente mais tarde.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Simplified mock function to simulate Gemini API call
  const generateSummaryWithGemini = async (content: string): Promise<string> => {
    // In a real implementation, this would call the Gemini API with the API key
    // const apiKey = "AIzaSyBto9zJDNJCvz76qz56oeMPOBfHhxjPTKA";

    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Este é um resumo gerado pela IA Gemini do conteúdo fornecido. Em uma implementação real, 
    a API do Gemini seria chamada com a chave fornecida (AIzaSyBto9zJDNJCvz76qz56oeMPOBfHhxjPTKA) e 
    retornaria um resumo conciso do texto original, destacando os pontos principais da notícia 
    jurídica e permitindo ao leitor entender rapidamente o conteúdo essencial do artigo.`;
  };
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });
  const categories = ["all", ...Array.from(new Set(news.map(item => item.category)))];
  return <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Newspaper className="mr-2 h-8 w-8 text-primary" />
          Notícias Jurídicas
        </h1>
        <p className="text-muted-foreground">
          Mantenha-se atualizado com as últimas notícias do mundo jurídico
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input className="pl-10" placeholder="Buscar notícias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.filter(c => c !== "all").map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="latest" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="latest">Mais Recentes</TabsTrigger>
          <TabsTrigger value="featured">Destaques</TabsTrigger>
          <TabsTrigger value="saved">Salvos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="latest">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-0 py-0 my-0 mx-0">
            {loading ? Array(6).fill(0).map((_, idx) => <Card key={idx} className="overflow-hidden">
                  <Skeleton className="h-48 rounded-b-none" />
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>) : filteredNews.length > 0 ? filteredNews.map(item => <motion.div key={item.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3
          }}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                    <div className="w-full h-48 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                        <Tag className="h-3 w-3 ml-2" />
                        <span>{item.category}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 mb-2">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow">
                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <User className="h-3 w-3 mr-1" />
                        <span>{item.author}</span>
                        <span className="mx-2">•</span>
                        <span>{item.source}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, idx) => <span key={idx} className="bg-muted px-2 py-0.5 rounded-md text-xs">
                            {tag}
                          </span>)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleGenerateSummary(item)}>
                            <FileText className="h-4 w-4 mr-1" />
                            Resumo IA
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Resumo gerado por IA</DrawerTitle>
                            <DrawerDescription>
                              {item.title}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4">
                            {summaryLoading ? <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                              </div> : <p className="text-sm whitespace-pre-line">{summary}</p>}
                          </div>
                          <DrawerFooter>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Resumo gerado pela IA Gemini</span>
                            </div>
                            <DrawerClose asChild>
                              <Button variant="outline">Fechar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <BookmarkIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>) : <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhuma notícia encontrada para os critérios selecionados.</p>
              </div>}
          </div>
        </TabsContent>
        
        <TabsContent value="featured">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Os destaques estarão disponíveis em breve.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Você ainda não salvou nenhuma notícia.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Noticias;