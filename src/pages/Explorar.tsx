
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, BookOpen, Brain, FileText, GraduationCap, FilePlus, Gavel, 
         PenTool, Newspaper, MessageSquare, Monitor, Search, Scale, BookMarked, 
         Clock, FileSymlink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Explorar = () => {
  const navigate = useNavigate();
  
  const allFeatures = [
    {
      category: "Materiais de Estudo",
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
      category: "Prática e Treinamento",
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
      category: "Conteúdo e Ferramentas",
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
      category: "Ferramentas Jurídicas",
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

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Scale className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1">Explorar</h1>
          <p className="text-muted-foreground">
            Conheça todos os recursos disponíveis
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {allFeatures.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl font-semibold mb-4 px-2">
              {category.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.items.map((feature, index) => (
                <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-3 pt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(feature.path)} 
                      className="w-full text-xs min-h-[48px]"
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
    </div>
  );
};

export default Explorar;
