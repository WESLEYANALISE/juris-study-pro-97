
import React from "react";
import { Button } from "@/components/ui/button";
import { Scale, Video, BookOpen, Brain, FileText, GraduationCap, FilePlus, Gavel, PenTool, Newspaper, MessageSquare, Monitor, Headphones, CreditCard } from "lucide-react";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { JuridicalCard } from "@/components/ui/juridical-card";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  const navigate = useNavigate();
  const { subscribed } = useSubscription();

  // Define categories for the main content
  const featuredCategories = [{
    title: "Ferramentas Jurídicas Principais",
    items: [{
      icon: BookOpen,
      title: "Vade-Mecum",
      description: "Acesse códigos e estatutos jurídicos atualizados",
      path: "/vademecum",
      color: "bg-blue-500"
    }, {
      icon: Headphones,
      title: "Podcasts",
      description: "Conteúdo jurídico em áudio para estudar em qualquer lugar",
      path: "/podcasts",
      color: "bg-red-500"
    }, {
      icon: GraduationCap,
      title: "Questões",
      description: "Pratique com questões das principais bancas",
      path: "/questoes",
      color: "bg-amber-500"
    }]
  }];

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
      icon: Headphones,
      title: "Podcasts",
      description: "Aprenda direito ouvindo, em qualquer lugar",
      path: "/podcasts",
      color: "text-red-500"
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
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto py-6 pb-20 md:pb-6 px-[5px]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="mb-6">
            <div className="relative mx-auto mb-3">
              <Scale className="h-16 w-16 text-primary mx-auto" />
              <motion.div 
                className="absolute -inset-4 rounded-full opacity-20 bg-primary blur-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Direito 360
            </h1>
            <p className="text-xl text-muted-foreground">
              Plataforma completa para estudos jurídicos
            </p>
          </div>
          
          {/* Subscription CTA */}
          {!subscribed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <Button 
                onClick={() => navigate("/assinatura")} 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Assine o plano Premium
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Desbloqueie acesso completo a todo o conteúdo premium
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Featured Categories at the top */}
        {featuredCategories.map((category, index) => (
          <FeaturedCategories key={index} title={category.title} items={category.items} />
        ))}

        {/* Category Carousels */}
        <div className="space-y-10">
          {categories.map((category, categoryIndex) => (
            <CategoryCarousel key={categoryIndex} title={category.title} items={category.items} />
          ))}
        </div>

        {/* Profile selection */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-purple p-6 rounded-lg shadow-sm mt-10 mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <span>Escolha seu perfil de estudos</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <JuridicalCard
              title="Concurseiro"
              description="Foco em conteúdos para concursos públicos"
              icon="landmark"
              variant="primary"
              className="cursor-pointer"
            />
            
            <JuridicalCard
              title="Universitário"
              description="Material para graduação em Direito"
              icon="book"
              variant="default"
              className="cursor-pointer"
            />
            
            <JuridicalCard
              title="Advogado"
              description="Recursos para a prática profissional"
              icon="scales"
              variant="secondary"
              className="cursor-pointer"
            />
          </div>
        </motion.div>
      </div>
    </JuridicalBackground>
  );
};

export default Index;
