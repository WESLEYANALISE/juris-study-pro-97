
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, BookOpen, Scale, Gavel, FileText, Library, BrainCircuit, HeartHandshake, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const EstudoTrilha = () => {
  const trilhas = [
    {
      nivel: "Básico",
      cards: [
        {
          titulo: "Introdução ao Direito", 
          descricao: "Conceitos fundamentais, fontes do Direito e normas jurídicas", 
          icon: BookOpen,
          ordem: 1
        },
        {
          titulo: "Direito Constitucional Básico", 
          descricao: "Constituição, princípios fundamentais e organização do Estado", 
          icon: ScrollText,
          ordem: 2
        },
        {
          titulo: "Direito Civil - Parte Geral", 
          descricao: "Pessoas, bens, fatos e negócios jurídicos", 
          icon: FileText,
          ordem: 3
        }
      ]
    },
    {
      nivel: "Intermediário",
      cards: [
        {
          titulo: "Direito Penal - Parte Geral", 
          descricao: "Princípios, teoria do crime e aplicação da lei penal", 
          icon: Gavel,
          ordem: 4
        },
        {
          titulo: "Direito Processual Civil", 
          descricao: "Procedimentos, petições e atos processuais", 
          icon: Scale,
          ordem: 5
        },
        {
          titulo: "Direito Administrativo", 
          descricao: "Administração pública, atos administrativos e licitações", 
          icon: Library,
          ordem: 6
        }
      ]
    },
    {
      nivel: "Avançado",
      cards: [
        {
          titulo: "Direito Tributário", 
          descricao: "Sistema tributário, impostos e obrigações fiscais", 
          icon: BrainCircuit,
          ordem: 7
        },
        {
          titulo: "Direito do Trabalho", 
          descricao: "Relações de trabalho, direitos trabalhistas e previdência", 
          icon: HeartHandshake,
          ordem: 8
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Trilha de Estudo Recomendada</h2>
        <p className="text-muted-foreground">
          Um guia estruturado para iniciar seus estudos jurídicos na ordem mais didática.
        </p>
      </div>

      <div className="space-y-10">
        {trilhas.map((trilha, idx) => (
          <motion.div 
            key={trilha.nivel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">{trilha.nivel}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trilha.cards.map((card) => (
                <Card key={card.titulo} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <card.icon className="h-8 w-8 text-primary" />
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        Passo {card.ordem}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{card.titulo}</CardTitle>
                    <CardDescription>{card.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">Ver materiais</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-md border border-border mt-8">
        <h4 className="font-medium mb-2">Dica para iniciantes</h4>
        <p className="text-sm text-muted-foreground">
          A trilha de estudo foi organizada para oferecer uma progressão coerente. 
          Recomendamos seguir a ordem sugerida para construir uma base sólida de conhecimentos jurídicos.
        </p>
      </div>
    </div>
  );
};
