
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, PlayCircle, Sparkles, FileQuestion, FileText, Calendar, Users, Trophy, LineChart, Heart } from 'lucide-react';
import { EstudoTrilha } from '@/components/iniciando/EstudoTrilha';
import { GlossarioJuridico } from '@/components/iniciando/GlossarioJuridico';
import { MiniCursos } from '@/components/iniciando/MiniCursos';
import { FAQ } from '@/components/iniciando/FAQ';
import { SimuladosIniciantes } from '@/components/iniciando/Simulados';
import { MateriaisEssenciais } from '@/components/iniciando/MateriaisEssenciais';
import { CronogramaEstudos } from '@/components/iniciando/CronogramaEstudos';
import { PerfilEvolucao } from '@/components/iniciando/PerfilEvolucao';
import { MotivacionalSucesso } from '@/components/iniciando/MotivacionalSucesso';

const IniciandoNoDireito = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Iniciando no Direito</h1>
        <p className="text-lg text-muted-foreground">
          Tudo o que você precisa para começar sua jornada nos estudos jurídicos
        </p>
      </motion.div>

      <Tabs defaultValue="trilha" className="w-full space-y-6">
        <div className="sticky top-0 z-10 bg-background pt-2 pb-4 -mx-4 px-4 border-b">
          <TabsList className="inline-flex min-w-full sm:min-w-0 w-auto justify-start sm:justify-center gap-1 h-auto flex-wrap">
            <TabsTrigger value="trilha" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Trilha de Estudo</span>
            </TabsTrigger>
            <TabsTrigger value="glossario" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <Sparkles className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Glossário</span>
            </TabsTrigger>
            <TabsTrigger value="minicursos" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <PlayCircle className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Mini-cursos</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <FileQuestion className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="simulados" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <GraduationCap className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Simulados</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="sticky top-[73px] z-10 bg-background pt-2 pb-4 -mx-4 px-4 border-b">
          <TabsList className="inline-flex min-w-full sm:min-w-0 w-auto justify-start sm:justify-center gap-1 h-auto flex-wrap">
            <TabsTrigger value="materiais" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="cronograma" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Cronograma</span>
            </TabsTrigger>
            <TabsTrigger value="comunidade" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Comunidade</span>
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <LineChart className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Evolução</span>
            </TabsTrigger>
            <TabsTrigger value="motivacional" className="flex flex-col items-center p-2 h-auto min-w-[80px] sm:min-w-[100px]">
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs whitespace-nowrap">Motivacional</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="pb-20 md:pb-6 pt-4">
          <TabsContent value="trilha">
            <EstudoTrilha />
          </TabsContent>
          
          <TabsContent value="glossario">
            <GlossarioJuridico />
          </TabsContent>
          
          <TabsContent value="minicursos">
            <MiniCursos />
          </TabsContent>
          
          <TabsContent value="faq">
            <FAQ />
          </TabsContent>
          
          <TabsContent value="simulados">
            <SimuladosIniciantes />
          </TabsContent>
          
          <TabsContent value="materiais">
            <MateriaisEssenciais />
          </TabsContent>
          
          <TabsContent value="cronograma">
            <CronogramaEstudos />
          </TabsContent>
          
          <TabsContent value="comunidade">
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
          
          <TabsContent value="evolucao">
            <PerfilEvolucao />
          </TabsContent>
          
          <TabsContent value="motivacional">
            <MotivacionalSucesso />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default IniciandoNoDireito;
