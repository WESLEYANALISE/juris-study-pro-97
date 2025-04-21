import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, Video, BookOpen, Brain, GraduationCap, FilePlus, 
  MessageSquare, LibrarySquare, Gavel, Newspaper, FileText,
  PenTool, Monitor, MonitorCheck, Calendar, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const categories = [
    {
      title: "Materiais de Estudo",
      items: [
        {
          icon: Video,
          title: "Vídeo-aulas",
          description: "Assista às aulas das principais disciplinas jurídicas",
          path: "/videoaulas",
          color: "text-blue-500"
        },
        {
          icon: BookOpen,
          title: "Biblioteca Jurídica",
          description: "Acesse livros, códigos e materiais de estudo",
          path: "/biblioteca",
          color: "text-green-500"
        },
        {
          icon: Brain,
          title: "Flashcards",
          description: "Memorize conceitos com repetição espaçada",
          path: "/flashcards",
          color: "text-purple-500"
        },
        {
          icon: FileText,
          title: "Resumos",
          description: "Banco de resumos e geração de novos resumos",
          path: "/resumos",
          color: "text-yellow-500"
        }
      ]
    },
    {
      title: "Prática e Treinamento",
      items: [
        {
          icon: GraduationCap,
          title: "Simulados",
          description: "Pratique com questões das principais bancas",
          path: "/simulados",
          color: "text-amber-500"
        },
        {
          icon: FilePlus,
          title: "Peticionário",
          description: "Modelos e templates de peças jurídicas",
          path: "/peticionario",
          color: "text-rose-500"
        },
        {
          icon: Gavel,
          title: "Jurisprudência",
          description: "Busque decisões judiciais e precedentes",
          path: "/jurisprudencia",
          color: "text-indigo-500"
        },
        {
          icon: PenTool,
          title: "Anotações",
          description: "Salve e organize suas anotações de estudo",
          path: "/anotacoes",
          color: "text-emerald-500"
        }
      ]
    },
    {
      title: "Conteúdo e Ferramentas",
      items: [
        {
          icon: Newspaper,
          title: "Notícias Jurídicas",
          description: "Atualizações do mundo jurídico",
          path: "/noticias",
          color: "text-cyan-500"
        },
        {
          icon: MessageSquare,
          title: "Bloger",
          description: "Artigos e publicações sobre Direito",
          path: "/bloger",
          color: "text-teal-500"
        },
        {
          icon: Monitor,
          title: "Remote Desktop",
          description: "Acesse sua área de trabalho remotamente",
          path: "/remote-desktop",
          color: "text-pink-500"
        },
        {
          icon: MessageSquare,
          title: "Assistente Jurídico",
          description: "Tire dúvidas com IA e obtenha ajuda",
          path: "/assistente",
          color: "text-orange-500"
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <Scale className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold mb-1">JurisStudy Pro</h1>
          <p className="text-lg text-muted-foreground">
            Plataforma completa para estudos jurídicos
          </p>
        </div>
        <div className="max-w-2xl mb-4">
          <p className="mb-4 text-sm md:text-base">
            Seja bem-vindo à plataforma JurisStudy Pro, seu ambiente completo para estudos jurídicos.
            Acesse videoaulas, materiais, simulados e muito mais, tudo em um só lugar.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              size="sm" 
              onClick={() => navigate("/videoaulas")}
              className="text-xs md:text-sm"
            >
              <Video className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              Começar com Vídeo-aulas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs md:text-sm"
            >
              Saiba mais
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl font-semibold mb-4 px-2">{category.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {category.items.map((feature, index) => (
                <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                  <CardHeader className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      <CardTitle className="text-sm md:text-base">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-2 md:p-3 pt-0">
                    <Button 
                      className="w-full text-xs py-1 h-8" 
                      variant="outline"
                      onClick={() => navigate(feature.path)}
                    >
                      Acessar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm mt-8 mb-6">
        <h2 className="text-xl font-bold mb-3">Escolha seu perfil de estudos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-3">
              <CardTitle className="text-base">Concurseiro</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs">Foco em conteúdos para concursos públicos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-3">
              <CardTitle className="text-base">Universitário</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs">Material para graduação em Direito</p>
            </CardContent>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-3">
              <CardTitle className="text-base">Advogado</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs">Recursos para a prática profissional</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
