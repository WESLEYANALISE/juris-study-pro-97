
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const MiniCursos = () => {
  const cursos = [
    {
      id: 1,
      titulo: "Como Funciona o Poder Judiciário",
      descricao: "Estrutura, competências e organização dos tribunais brasileiros",
      duracao: "15 minutos",
      thumbnail: "https://images.unsplash.com/photo-1589994965851-a7f32ec1b1b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "video"
    },
    {
      id: 2,
      titulo: "Diferença entre Leis, Decretos e Portarias",
      descricao: "Entenda a hierarquia das normas jurídicas e suas características",
      duracao: "12 minutos",
      thumbnail: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "video"
    },
    {
      id: 3,
      titulo: "Direitos Fundamentais na Constituição",
      descricao: "Conheça os principais direitos e garantias da CF/88",
      duracao: "18 minutos",
      thumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "video"
    },
    {
      id: 4,
      titulo: "Introdução ao Processo Civil",
      descricao: "Conceitos básicos sobre o funcionamento de um processo civil",
      duracao: "20 minutos",
      thumbnail: "https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "video"
    },
    {
      id: 5,
      titulo: "O que é a OAB e como funciona",
      descricao: "Papel da Ordem dos Advogados do Brasil e o Exame da Ordem",
      duracao: "10 minutos",
      thumbnail: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "audio"
    },
    {
      id: 6,
      titulo: "Áreas do Direito para Atuar",
      descricao: "Panorama das principais áreas de atuação profissional",
      duracao: "22 minutos",
      thumbnail: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tipo: "audio"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Mini-cursos Introdutórios</h2>
        <p className="text-muted-foreground">
          Aulas rápidas para entender os fundamentos básicos do Direito.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso, idx) => (
          <motion.div
            key={curso.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={curso.thumbnail} 
                  alt={curso.titulo} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {curso.duracao}
                </div>
              </div>
              <CardContent className="flex-grow py-4">
                <div className="flex items-center gap-2 mb-2">
                  {curso.tipo === 'video' ? (
                    <PlayCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {curso.tipo === 'video' ? 'Vídeo-aula' : 'Podcast'}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{curso.titulo}</h3>
                <p className="text-sm text-muted-foreground">{curso.descricao}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">Assistir agora</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
