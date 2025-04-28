
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const GlossarioJuridico = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const glossario = [
    {
      termo: "Constituição",
      definicao: "Lei fundamental e suprema do país, que contém normas referentes à estruturação do Estado, à formação dos poderes públicos, forma de governo, aquisição do poder, distribuição de competências.",
      exemplo: "A Constituição Federal de 1988 é a lei maior do Brasil."
    },
    {
      termo: "Jurisprudência",
      definicao: "Conjunto de decisões reiteradas dos tribunais sobre determinada matéria, que serve como orientação para casos semelhantes.",
      exemplo: "A jurisprudência do STF tem entendido que..."
    },
    {
      termo: "Contrato",
      definicao: "Acordo de vontades entre duas ou mais pessoas com o objetivo de criar, modificar ou extinguir direitos e deveres de conteúdo patrimonial.",
      exemplo: "O contrato de aluguel estabelece as regras entre locador e locatário."
    },
    {
      termo: "Lei",
      definicao: "Norma jurídica escrita, emanada do Poder Legislativo, segundo um processo previamente estabelecido na Constituição.",
      exemplo: "O Código Civil é um conjunto de leis que regula as relações civis."
    },
    {
      termo: "Habeas Corpus",
      definicao: "Ação judicial que visa proteger o direito de liberdade de locomoção lesado ou ameaçado por ato ilegal ou abuso de poder.",
      exemplo: "O advogado impetrou habeas corpus para seu cliente que estava detido ilegalmente."
    },
    {
      termo: "Petição",
      definicao: "Documento formal dirigido a uma autoridade pública ou ao poder judiciário, solicitando algo com base em lei ou jurisprudência.",
      exemplo: "A petição inicial é o documento que dá início ao processo judicial."
    },
    {
      termo: "Audiência",
      definicao: "Sessão em que o juiz ouve as partes, testemunhas ou peritos para formar sua convicção sobre os fatos discutidos no processo.",
      exemplo: "Na audiência de instrução, foram ouvidas três testemunhas."
    },
    {
      termo: "Mandado",
      definicao: "Ordem escrita emitida por uma autoridade judicial ou administrativa para que se cumpra um ato.",
      exemplo: "O juiz expediu um mandado de busca e apreensão."
    }
  ];

  const filteredTerms = searchTerm
    ? glossario.filter(item => 
        item.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definicao.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : glossario;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Glossário Jurídico para Iniciantes</h2>
        <p className="text-muted-foreground">
          Termos essenciais explicados de forma simples para quem está começando no Direito.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          className="pl-9"
          placeholder="Pesquisar termo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <motion.div
            key={item.termo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{item.termo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{item.definicao}</p>
                <p className="text-sm text-muted-foreground italic">
                  <span className="font-medium">Exemplo:</span> {item.exemplo}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum termo encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
