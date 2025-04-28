
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

export const FAQ = () => {
  const faqItems = [
    {
      pergunta: "O que preciso estudar primeiro no Direito?",
      resposta: "Recomenda-se começar pela Introdução ao Estudo do Direito, seguida pelo Direito Constitucional, que é a base do ordenamento jurídico brasileiro. Depois, avance para o Direito Civil (parte geral) e Direito Penal. Esses conteúdos fornecem a base necessária para entender outras áreas mais específicas."
    },
    {
      pergunta: "Quanto tempo leva para passar na OAB?",
      resposta: "O tempo varia de pessoa para pessoa, mas em média os estudantes conseguem ser aprovados após 6 meses a 1 ano de estudo direcionado para o Exame, desde que já tenham uma boa base dos conteúdos da graduação. Muitos recém-formados optam por cursos preparatórios específicos para a OAB."
    },
    {
      pergunta: "Quais livros são essenciais para iniciantes em Direito?",
      resposta: "Alguns livros fundamentais incluem 'Curso de Direito Constitucional' de Gilmar Mendes, 'Manual de Direito Civil' de Flávio Tartuce, 'Curso de Direito Penal' de Rogério Greco e 'Manual de Direito Administrativo' de José dos Santos Carvalho Filho. Para introdução, 'Como Estudar e Passar em Provas de Concursos Jurídicos' de William Douglas também é muito recomendado."
    },
    {
      pergunta: "É possível estudar Direito sozinho?",
      resposta: "Sim, é possível estudar muitos conteúdos jurídicos de forma autodidata, especialmente com o acesso a materiais online, videoaulas e livros. No entanto, o debate e a troca de ideias são fundamentais para a formação jurídica. Recomenda-se participar de grupos de estudo, fóruns online ou comunidades jurídicas para complementar o estudo individual."
    },
    {
      pergunta: "Como fazer fichamentos de leis e decisões?",
      resposta: "Para fichamentos eficientes, identifique os pontos principais da lei ou decisão. Registre: 1) Identificação (número da lei/decisão), 2) Ementa/resumo, 3) Pontos-chave, 4) Artigos/trechos importantes com sua interpretação, 5) Conexões com outros dispositivos legais. Use cores e símbolos para destacar pontos relevantes e revisite seus fichamentos periodicamente."
    },
    {
      pergunta: "Como memorizar artigos de lei?",
      resposta: "Em vez de decorar, entenda o contexto e a lógica por trás do artigo. Utilize técnicas como: repetição espaçada, associações mentais, resumos com próprias palavras, estudo ativo (explicar como se estivesse ensinando) e aplicação prática em casos concretos. Flashcards e mapas mentais também são ferramentas eficazes."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Perguntas Frequentes</h2>
        <p className="text-muted-foreground">
          Respostas para as dúvidas mais comuns de quem está iniciando no Direito.
        </p>
      </div>

      <Card className="border">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="px-4 text-left">
                {item.pergunta}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-muted-foreground">
                {item.resposta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <div className="text-sm text-muted-foreground mt-4">
        <p>Não encontrou sua dúvida? Utilize nosso Assistente Jurídico para perguntas personalizadas.</p>
      </div>
    </div>
  );
};
