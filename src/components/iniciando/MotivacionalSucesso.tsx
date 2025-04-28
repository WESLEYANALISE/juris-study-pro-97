
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quote, Play, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const MotivacionalSucesso = () => {
  const depoimentos = [
    {
      id: 1,
      nome: "Ana Carolina Silva",
      cargo: "Juíza Federal",
      texto: "Comecei a estudar direito aos 24 anos, já trabalhando em outra área. Foi desafiador no início, mas a persistência e a organização nos estudos me levaram à aprovação em um dos concursos mais difíceis do país.",
      area: "Concursos",
      videoId: "dQw4w9WgXcQ" // Exemplo apenas, deve ser substituído
    },
    {
      id: 2,
      nome: "Roberto Mendes",
      cargo: "Advogado Criminalista",
      texto: "Na faculdade, tinha muita dificuldade nas matérias de Direito Penal. Desenvolvi um método próprio de estudo, focando na jurisprudência, e hoje sou especialista na área que mais me desafiou.",
      area: "Advocacia",
      videoId: "dQw4w9WgXcQ" // Exemplo apenas, deve ser substituído
    },
    {
      id: 3,
      nome: "Mariana Costa",
      cargo: "Procuradora Municipal",
      texto: "Reprovei 3 vezes na OAB enquanto tentava conciliar trabalho e estudo. Quando organizei meu tempo e foquei nos pontos fracos, consegui a aprovação e depois passei em um concurso público de prestígio.",
      area: "OAB/Concursos",
      videoId: "dQw4w9WgXcQ" // Exemplo apenas, deve ser substituído
    }
  ];

  const dicas = [
    {
      titulo: "Consistência supera intensidade",
      texto: "Estudar 1 hora todos os dias é melhor que 7 horas em um único dia da semana."
    },
    {
      titulo: "Aprenda com os erros",
      texto: "Analisar questões que errou ensina mais que revisar as que acertou."
    },
    {
      titulo: "Ensine para aprender",
      texto: "Explicar um tema para outra pessoa solidifica seu próprio conhecimento."
    },
    {
      titulo: "Foque no que importa",
      texto: "80% das questões vêm de 20% do conteúdo. Identifique esse conteúdo essencial."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Histórias de Sucesso</h2>
        <p className="text-muted-foreground">
          Inspire-se com quem começou do zero e conquistou seus objetivos na área jurídica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {depoimentos.map((depoimento, idx) => (
          <motion.div
            key={depoimento.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <div className="relative aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full w-12 h-12"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${depoimento.videoId}`, "_blank")}
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
                <img 
                  src={`https://img.youtube.com/vi/${depoimento.videoId}/hqdefault.jpg`}
                  alt={depoimento.nome} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="flex-grow pt-4">
                <div className="flex justify-between mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {depoimento.area}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold">{depoimento.nome}</h3>
                  <p className="text-xs text-muted-foreground">
                    {depoimento.cargo}
                  </p>
                </div>
                
                <div className="pl-4 border-l-2 border-primary/30 italic text-sm text-muted-foreground">
                  <Quote className="h-4 w-4 text-primary mb-1" />
                  <p>{depoimento.texto}</p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-xs"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${depoimento.videoId}`, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Assistir depoimento completo
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-4 mt-8">
        <h3 className="font-medium text-lg mb-4">Dicas dos que já chegaram lá</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dicas.map((dica, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-primary">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-medium text-sm">{dica.titulo}</h4>
                <p className="text-xs text-muted-foreground">{dica.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-muted-foreground text-sm mb-3">
          "O sucesso é a soma de pequenos esforços repetidos dia após dia." - Robert Collier
        </p>
        <Button>Compartilhe sua história</Button>
      </div>
    </div>
  );
};
