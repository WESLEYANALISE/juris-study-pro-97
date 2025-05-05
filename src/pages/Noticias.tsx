import React from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for news articles
const newsArticles = [
  {
    id: 1,
    title: 'STF Decide Sobre Novo Tema de Repercussão Geral',
    summary: 'O Supremo Tribunal Federal decidiu que o tema 1234 terá repercussão geral, afetando processos em todo o país.',
    category: 'STF',
    date: '2023-05-15',
    author: 'João Silva',
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'Nova Lei de Licitações: O Que Mudou?',
    summary: 'A nova lei de licitações entrou em vigor e traz diversas modificações importantes para contratações públicas.',
    category: 'Legislação',
    date: '2023-05-10',
    author: 'Maria Santos',
    readTime: '7 min'
  },
  {
    id: 3,
    title: 'STJ Unifica Entendimento Sobre Contratos de Adesão',
    summary: 'Em decisão recente, o Superior Tribunal de Justiça unificou o entendimento sobre cláusulas abusivas em contratos de adesão.',
    category: 'STJ',
    date: '2023-05-08',
    author: 'Carlos Oliveira',
    readTime: '4 min'
  },
  {
    id: 4,
    title: 'TST Define Nova Súmula Sobre Horas Extras',
    summary: 'O Tribunal Superior do Trabalho publicou nova súmula que trata do cálculo de horas extras para trabalhadores em regime 12x36.',
    category: 'Trabalhista',
    date: '2023-05-05',
    author: 'Ana Paula Mendes',
    readTime: '6 min'
  },
  {
    id: 5,
    title: 'CNJ Publica Novas Diretrizes para Audiências Virtuais',
    summary: 'O Conselho Nacional de Justiça publicou resolução com novas diretrizes para a realização de audiências em formato virtual.',
    category: 'CNJ',
    date: '2023-05-01',
    author: 'Roberto Campos',
    readTime: '3 min'
  },
  {
    id: 6,
    title: 'Congresso Aprova Alterações no Código Penal',
    summary: 'O Congresso Nacional aprovou projeto de lei que altera dispositivos do Código Penal relacionados a crimes digitais.',
    category: 'Legislação',
    date: '2023-04-28',
    author: 'Fernanda Lima',
    readTime: '8 min'
  }
];

export default function Noticias() {
  return (
    <JuridicalBackground variant="dots">
      <Container className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl font-bold">Notícias Jurídicas</h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe as últimas novidades do mundo jurídico
          </p>
        </motion.div>

        <Tabs defaultValue="todas" className="space-y-8">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="stf">STF</TabsTrigger>
            <TabsTrigger value="stj">STJ</TabsTrigger>
            <TabsTrigger value="legislacao">Legislação</TabsTrigger>
            <TabsTrigger value="trabalhista">Trabalhista</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {article.readTime}
                        </span>
                      </div>
                      <CardTitle className="leading-tight">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {/* Content could go here */}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" /> {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {article.date}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline">Carregar mais notícias</Button>
            </div>
          </TabsContent>

          {/* Other tabs would filter the content */}
          <TabsContent value="stf" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles
                .filter(article => article.category === 'STF')
                .map((article, index) => (
                  <Card key={article.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {article.readTime}
                        </span>
                      </div>
                      <CardTitle className="leading-tight">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {/* Content could go here */}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" /> {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {article.date}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          {/* Similar structure for other tabs */}
          <TabsContent value="stj" className="space-y-8">
            {/* STJ content */}
            <div className="text-center py-8">
              <p>Exibindo notícias do STJ</p>
            </div>
          </TabsContent>
          
          <TabsContent value="legislacao" className="space-y-8">
            {/* Legislação content */}
            <div className="text-center py-8">
              <p>Exibindo notícias de Legislação</p>
            </div>
          </TabsContent>
          
          <TabsContent value="trabalhista" className="space-y-8">
            {/* Trabalhista content */}
            <div className="text-center py-8">
              <p>Exibindo notícias Trabalhistas</p>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </JuridicalBackground>
  );
}
