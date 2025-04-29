
import React from "react";
import { Button } from "@/components/ui/button";
import { Scale, Video, BookOpen, Brain, FileText, GraduationCap, FilePlus, Gavel, PenTool, Newspaper, MessageSquare, Monitor } from "lucide-react";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import WelcomeCard from "@/components/WelcomeCard";

const Index = () => {
  const navigate = useNavigate();

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
      icon: Video,
      title: "JurisFlix",
      description: "Conteúdo jurídico em vídeo e áudio",
      path: "/jurisflix",
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const scaleIconVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="container mx-auto py-6 pb-20 md:pb-6 px-[5px]">
      {/* Welcome Card at the top */}
      <WelcomeCard
        userName="Estudante"
        nextTaskTitle="Revisão de Direito Constitucional"
        nextTaskTime="Hoje, 19:00"
        progress={65}
      />

      {/* Header Section with Icon */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="mb-6 relative">
          <motion.div 
            whileHover="hover" 
            initial="initial"
            variants={scaleIconVariants}
          >
            <Scale className="h-16 w-16 text-primary mx-auto mb-3" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">JurisStudy Pro</h1>
          </motion.div>
          <p className="text-xl text-muted-foreground">
            Plataforma completa para estudos jurídicos
          </p>
        </div>
      </motion.div>

      {/* Featured Categories at the top */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {featuredCategories.map((category, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FeaturedCategories
              key={index} 
              title={category.title} 
              items={category.items} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Category Carousels */}
      <motion.div 
        className="space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: 0.3 }}
      >
        {categories.map((category, categoryIndex) => (
          <motion.div key={categoryIndex} variants={itemVariants}>
            <CategoryCarousel 
              title={category.title} 
              items={category.items} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Profile selection */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-primary/5 p-6 rounded-lg shadow-md mt-10 mb-6 border border-primary/20"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <GraduationCap className="mr-2 h-6 w-6 text-primary" />
          </motion.div>
          Escolha seu perfil de estudos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileCard 
            title="Concurseiro" 
            description="Foco em conteúdos para concursos públicos" 
            index={0}
          />
          
          <ProfileCard 
            title="Universitário" 
            description="Material para graduação em Direito" 
            index={1}
          />
          
          <ProfileCard 
            title="Advogado" 
            description="Recursos para a prática profissional" 
            index={2}
          />
        </div>
      </motion.div>
    </div>
  );
};

// Componente de perfil com animações melhoradas
const ProfileCard = ({ title, description, index }: { title: string, description: string, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 * index + 0.6 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="bg-card hover:bg-accent/10 transition-colors cursor-pointer border border-primary/30 hover:border-primary/50 shadow-subtle hover:shadow-glow">
        <CardHeader className="p-4">
          <CardTitle className="text-lg flex items-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 10,
                delay: 0.3 * index + 0.7 
              }}
              className="h-6 w-6 rounded-full bg-primary/20 p-1 mr-2 flex items-center justify-center"
            >
              <GraduationCap className="h-4 w-4 text-primary" />
            </motion.div>
            {title}
          </CardTitle>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default Index;
