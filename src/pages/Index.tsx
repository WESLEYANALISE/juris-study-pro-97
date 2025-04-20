
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Video, BookOpen, Brain, GraduationCap, FilePlus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
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
      description: "Memorize conceitos importantes com repetição espaçada",
      path: "/flashcards",
      color: "text-purple-500"
    },
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
      icon: MessageSquare,
      title: "Assistente Jurídico",
      description: "Tire dúvidas e obtenha ajuda personalizada",
      path: "/assistente",
      color: "text-teal-500"
    }
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="mb-6">
          <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">JurisStudy Pro</h1>
          <p className="text-xl text-muted-foreground">
            Plataforma completa para estudos jurídicos
          </p>
        </div>
        <div className="max-w-2xl">
          <p className="mb-6">
            Seja bem-vindo à plataforma JurisStudy Pro, seu ambiente completo para estudos jurídicos.
            Acesse videoaulas, materiais, simulados e muito mais, tudo em um só lugar.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/videoaulas")}
            >
              <Video className="mr-2 h-4 w-4" />
              Começar com Vídeo-aulas
            </Button>
            <Button 
              variant="outline" 
              size="lg"
            >
              Saiba mais
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <feature.icon className={`h-8 w-8 ${feature.color}`} />
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(feature.path)}
              >
                Acessar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Escolha seu perfil de estudos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Concurseiro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Foco em conteúdos para concursos públicos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Universitário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Material para graduação em Direito</p>
            </CardContent>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Advogado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Recursos para a prática profissional</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
