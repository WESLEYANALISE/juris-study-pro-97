
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  Video, 
  BookOpen, 
  Brain, 
  FileText, 
  GraduationCap, 
  FilePlus, 
  Gavel, 
  PenTool, 
  Newspaper, 
  MessageSquare, 
  Monitor 
} from "lucide-react";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  
  // Define categories for the main content
  const featuredCategories = [
    {
      title: "Ferramentas Jurídicas Principais",
      items: [
        {
          icon: BookOpen,
          title: "Vade-Mecum",
          description: "Acesse códigos e estatutos jurídicos atualizados",
          path: "/vademecum",
          color: "bg-blue-500"
        },
        {
          icon: Video,
          title: "JurisFlix",
          description: "Conteúdo jurídico em vídeo e áudio",
          path: "/jurisflix",
          color: "bg-red-500"
        },
        {
          icon: GraduationCap,
          title: "Questões",
          description: "Pratique com questões das principais bancas",
          path: "/questoes",
          color: "bg-amber-500"
        }
      ]
    }
  ];

  // Categories for the carousels
  const categories = [{
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
  }];

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="mb-6">
          <Scale className="h-16 w-16 text-primary mx-auto mb-3" />
          <h1 className="text-4xl font-bold mb-2">JurisStudy Pro</h1>
          <p className="text-xl text-muted-foreground">
            Plataforma completa para estudos jurídicos
          </p>
        </div>
      </motion.div>

      {/* Featured Categories at the top */}
      {featuredCategories.map((category, index) => (
        <FeaturedCategories 
          key={index}
          title={category.title}
          items={category.items}
        />
      ))}

      {/* Category Carousels */}
      <div className="space-y-10">
        {categories.map((category, categoryIndex) => (
          <CategoryCarousel
            key={categoryIndex}
            title={category.title}
            items={category.items}
          />
        ))}
      </div>

      {/* Profile selection */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card p-6 rounded-lg shadow-sm mt-10 mb-6"
      >
        <h2 className="text-2xl font-bold mb-4">Escolha seu perfil de estudos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Concurseiro</CardTitle>
              <CardDescription className="text-sm">
                Foco em conteúdos para concursos públicos
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Universitário</CardTitle>
              <CardDescription className="text-sm">
                Material para graduação em Direito
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Advogado</CardTitle>
              <CardDescription className="text-sm">
                Recursos para a prática profissional
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
