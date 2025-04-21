import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Video, BookOpen, Brain, GraduationCap, FilePlus, MessageSquare, 
         Gavel, Newspaper, FileText, PenTool, Monitor, BookMarked, Search, 
         Clock, FileSymlink, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const getRandomTranscript = (category: string, title: string) => {
  const transcripts = [
    `Este módulo de ${title} traz conteúdo essencial para sua preparação.`,
    `Acesse nosso acervo completo de ${title} para aprofundar seus estudos.`,
    `Material atualizado de ${title} com as últimas mudanças na legislação.`,
    `Prepare-se para a OAB com ${title} específicos para o exame.`,
    `Conteúdos de ${title} organizados para otimizar seu tempo de estudo.`,
    `Ferramentas de ${title} desenvolvidas pelos melhores especialistas.`,
    `Este ${category} oferece recursos práticos para seu aprendizado.`,
    `Acesse ${title} para complementar sua formação jurídica.`,
    `Conteúdo exclusivo de ${title} para alunos da plataforma.`,
    `Recursos de ${title} para facilitar sua jornada acadêmica.`
  ];
  
  return transcripts[Math.floor(Math.random() * transcripts.length)];
};

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [transcripts, setTranscripts] = useState<{[key: string]: string}>({});
  
  const categories = [
    {
      title: "Materiais de Estudo",
      items: [{
        icon: Video,
        title: "Vídeo-aulas",
        description: "Assista às aulas das principais disciplinas jurídicas",
        path: "/videoaulas",
        color: "text-blue-500"
      }, {
        icon: BookOpen,
        title: "Biblioteca Jurídica",
        description: "Acesse livros, códigos e materiais de estudo",
        path: "/biblioteca",
        color: "text-green-500"
      }, {
        icon: Brain,
        title: "Flashcards",
        description: "Memorize conceitos com repetição espaçada",
        path: "/flashcards",
        color: "text-purple-500"
      }, {
        icon: FileText,
        title: "Resumos",
        description: "Banco de resumos e geração de novos resumos",
        path: "/resumos",
        color: "text-yellow-500"
      }]
    }, {
      title: "Prática e Treinamento",
      items: [{
        icon: GraduationCap,
        title: "Simulados",
        description: "Pratique com questões das principais bancas",
        path: "/simulados",
        color: "text-amber-500"
      }, {
        icon: FilePlus,
        title: "Peticionário",
        description: "Modelos e templates de peças jurídicas",
        path: "/peticionario",
        color: "text-rose-500"
      }, {
        icon: Gavel,
        title: "Jurisprudência",
        description: "Busque decisões judiciais e precedentes",
        path: "/jurisprudencia",
        color: "text-indigo-500"
      }, {
        icon: PenTool,
        title: "Anotações",
        description: "Salve e organize suas anotações de estudo",
        path: "/anotacoes",
        color: "text-emerald-500"
      }]
    }, {
      title: "Conteúdo e Ferramentas",
      items: [{
        icon: Newspaper,
        title: "Notícias Jurídicas",
        description: "Atualizações do mundo jurídico",
        path: "/noticias",
        color: "text-cyan-500"
      }, {
        icon: MessageSquare,
        title: "Bloger",
        description: "Artigos e publicações sobre Direito",
        path: "/bloger",
        color: "text-teal-500"
      }, {
        icon: Monitor,
        title: "Remote Desktop",
        description: "Acesse sua área de trabalho remotamente",
        path: "/remote-desktop",
        color: "text-pink-500"
      }, {
        icon: MessageSquare,
        title: "Assistente Jurídico",
        description: "Tire dúvidas com IA e obtenha ajuda",
        path: "/assistente",
        color: "text-orange-500"
      }]
    }, {
      title: "Ferramentas Jurídicas",
      items: [{
        icon: BookMarked,
        title: "Vade Mecum Digital",
        description: "Códigos e legislação ao seu alcance",
        path: "/ferramentas/vademecum",
        color: "text-blue-600"
      }, {
        icon: Search,
        title: "Dicionário Jurídico",
        description: "Consulta de termos e conceitos jurídicos",
        path: "/ferramentas/dicionario",
        color: "text-purple-600"
      }, {
        icon: FileSymlink,
        title: "Modelos de Documentos",
        description: "Templates prontos para uso profissional",
        path: "/ferramentas/modelos",
        color: "text-green-600"
      }, {
        icon: Clock,
        title: "Cronograma de Estudos",
        description: "Organize sua rotina de preparação",
        path: "/ferramentas/cronograma",
        color: "text-amber-600"
      }]
    }
  ];

  useEffect(() => {
    const generateAllTranscripts = () => {
      const newTranscripts: {[key: string]: string} = {};
      
      categories.forEach(category => {
        category.items.forEach(item => {
          const key = `${category.title}-${item.title}`;
          newTranscripts[key] = getRandomTranscript(category.title, item.title);
        });
      });
      
      setTranscripts(newTranscripts);
    };
    
    generateAllTranscripts();
    const interval = setInterval(generateAllTranscripts, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-0 px-1 sm:px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <Scale className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold mb-1">JurisStudy Pro</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Plataforma completa para estudos jurídicos
          </p>
          <div className="w-full max-w-lg mx-auto mb-6">
            {user ? (
              <Button size="sm" variant="outline" onClick={signOut} className="mb-2 float-end">
                Sair
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")} className="mb-2 float-end">
                Entrar
              </Button>
            )}
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="space-y-8 px-1">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl font-semibold mb-4 px-2 flex justify-between items-center">
              {category.title}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/explorar")}
                className="text-xs flex items-center"
              >
                Ver mais <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </h2>
            <Carousel
              opts={{
                align: "start",
                containScroll: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {category.items.map((feature, index) => {
                  const transcriptKey = `${category.title}-${feature.title}`;
                  return (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] md:basis-1/3">
                      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full">
                        <CardHeader className="p-3 md:p-4">
                          <div className="flex items-center gap-2">
                            <feature.icon className={`h-5 w-5 ${feature.color}`} />
                            <CardTitle className="text-sm md:text-base">{feature.title}</CardTitle>
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pb-0 pt-0">
                          <div className="text-xs text-muted-foreground h-10 line-clamp-2 italic">
                            "{transcripts[transcriptKey] || getRandomTranscript(category.title, feature.title)}"
                          </div>
                        </CardContent>
                        <CardFooter className="p-2 md:p-3 pt-0">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(feature.path)} 
                            className="w-full text-xs min-h-[48px]"
                          >
                            Acessar
                          </Button>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
