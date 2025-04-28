
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, PlayCircle, Sparkles, FileQuestion, FileText, Calendar, Users, Trophy, LineChart, Heart } from 'lucide-react';

// Import components for each section
import { EstudoTrilha } from "@/components/iniciando/EstudoTrilha";
import { GlossarioJuridico } from "@/components/iniciando/GlossarioJuridico";
import { MiniCursos } from "@/components/iniciando/MiniCursos";
import { FAQ } from "@/components/iniciando/FAQ";
import { SimuladosIniciantes } from "@/components/iniciando/Simulados";
import { MateriaisEssenciais } from "@/components/iniciando/MateriaisEssenciais";
import { CronogramaEstudos } from "@/components/iniciando/CronogramaEstudos";
import { PerfilEvolucao } from "@/components/iniciando/PerfilEvolucao";
import { MotivacionalSucesso } from "@/components/iniciando/MotivacionalSucesso";

const IniciandoNoDireito = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold">Iniciando no Direito</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tudo o que você precisa para começar sua jornada nos estudos jurídicos
        </p>
      </motion.div>

      <Tabs defaultValue="trilha" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="trilha" className="flex flex-col items-center py-2 h-auto">
            <BookOpen className="h-5 w-5 mb-1" />
            <span className="text-xs">Trilha de Estudo</span>
          </TabsTrigger>
          <TabsTrigger value="glossario" className="flex flex-col items-center py-2 h-auto">
            <Sparkles className="h-5 w-5 mb-1" />
            <span className="text-xs">Glossário</span>
          </TabsTrigger>
          <TabsTrigger value="minicursos" className="flex flex-col items-center py-2 h-auto">
            <PlayCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Mini-cursos</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex flex-col items-center py-2 h-auto">
            <FileQuestion className="h-5 w-5 mb-1" />
            <span className="text-xs">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="simulados" className="flex flex-col items-center py-2 h-auto">
            <GraduationCap className="h-5 w-5 mb-1" />
            <span className="text-xs">Simulados</span>
          </TabsTrigger>
        </TabsList>

        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="materiais" className="flex flex-col items-center py-2 h-auto">
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="cronograma" className="flex flex-col items-center py-2 h-auto">
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs">Cronograma</span>
          </TabsTrigger>
          <TabsTrigger value="comunidade" className="flex flex-col items-center py-2 h-auto">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Comunidade</span>
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="flex flex-col items-center py-2 h-auto">
            <LineChart className="h-5 w-5 mb-1" />
            <span className="text-xs">Evolução</span>
          </TabsTrigger>
          <TabsTrigger value="motivacional" className="flex flex-col items-center py-2 h-auto">
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Motivacional</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trilha" className="mt-0">
          <EstudoTrilha />
        </TabsContent>
        
        <TabsContent value="glossario" className="mt-0">
          <GlossarioJuridico />
        </TabsContent>
        
        <TabsContent value="minicursos" className="mt-0">
          <MiniCursos />
        </TabsContent>
        
        <TabsContent value="faq" className="mt-0">
          <FAQ />
        </TabsContent>
        
        <TabsContent value="simulados" className="mt-0">
          <SimuladosIniciantes />
        </TabsContent>
        
        <TabsContent value="materiais" className="mt-0">
          <MateriaisEssenciais />
        </TabsContent>
        
        <TabsContent value="cronograma" className="mt-0">
          <CronogramaEstudos />
        </TabsContent>
        
        <TabsContent value="comunidade" className="mt-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-lg">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Comunidade para Iniciantes</h2>
              <p className="mb-6 text-muted-foreground">
                Um espaço seguro para tirar dúvidas básicas e conectar-se com outros estudantes de Direito.
              </p>
              <p className="mb-6 text-muted-foreground">
                Este recurso estará disponível em breve! Estamos trabalhando para criar um ambiente acolhedor para todos os iniciantes.
              </p>
              <div className="inline-flex gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm">Em desenvolvimento</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="evolucao" className="mt-0">
          <PerfilEvolucao />
        </TabsContent>
        
        <TabsContent value="motivacional" className="mt-0">
          <MotivacionalSucesso />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IniciandoNoDireito;
