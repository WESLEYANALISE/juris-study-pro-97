
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Check, Grid3X3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PalavraPos {
  palavra: string;
  x: number;
  y: number;
  direcao: "horizontal" | "vertical";
}

interface JogoPalavrasCruzadas {
  id: string;
  titulo: string;
  descricao: string;
  nivel_dificuldade: string;
  area_direito: string;
  palavras: PalavraPos[];
  dicas: Record<string, string>;
  grade_tamanho: {
    largura: number;
    altura: number;
  };
}

interface PalavrasCruzadasProps {
  gameId: string;
}

export const PalavrasCruzadas = ({ gameId }: PalavrasCruzadasProps) => {
  const [jogo, setJogo] = useState<JogoPalavrasCruzadas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [grade, setGrade] = useState<string[][]>([]);
  const [entradas, setEntradas] = useState<Record<string, string>>({});
  const [palavrasEncontradas, setPalavrasEncontradas] = useState<string[]>([]);
  const [dicaAtual, setDicaAtual] = useState<string>('');

  useEffect(() => {
    const fetchJogo = async () => {
      setIsLoading(true);
      try {
        // Busca o jogo correspondente na tabela jogos_categorias
        const { data: categoriaData } = await supabase
          .from('jogos_categorias')
          .select('*')
          .eq('id', gameId)
          .single();

        if (!categoriaData) {
          toast.error('Jogo não encontrado');
          return;
        }

        // Busca detalhes específicos deste jogo na tabela jogos_palavras_cruzadas
        const { data, error } = await supabase
          .from('jogos_palavras_cruzadas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          // Parse the JSON fields properly to match our types
          const rawData = data[0];
          const palavrasArray = JSON.parse(typeof rawData.palavras === 'string' ? rawData.palavras : JSON.stringify(rawData.palavras)) as PalavraPos[];
          const dicasObj = JSON.parse(typeof rawData.dicas === 'string' ? rawData.dicas : JSON.stringify(rawData.dicas)) as Record<string, string>;
          const gradeTamanhoObj = JSON.parse(typeof rawData.grade_tamanho === 'string' ? rawData.grade_tamanho : JSON.stringify(rawData.grade_tamanho)) as {largura: number, altura: number};
          
          const parsedJogo: JogoPalavrasCruzadas = {
            id: rawData.id,
            titulo: rawData.titulo,
            descricao: rawData.descricao,
            nivel_dificuldade: rawData.nivel_dificuldade,
            area_direito: rawData.area_direito,
            palavras: palavrasArray,
            dicas: dicasObj,
            grade_tamanho: gradeTamanhoObj
          };
          
          setJogo(parsedJogo);
          inicializarGrade(parsedJogo);
        }
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        toast.error('Não foi possível carregar o jogo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJogo();
  }, [gameId]);

  // Initialize the empty grid based on game dimensions
  const inicializarGrade = (jogoData: JogoPalavrasCruzadas) => {
    const { largura, altura } = jogoData.grade_tamanho;
    const novaGrade: string[][] = Array(altura).fill('').map(() => Array(largura).fill(''));
    setGrade(novaGrade);
    
    // Pre-fill any known letters from words
    const novasEntradas: Record<string, string> = {};
    jogoData.palavras.forEach(palavra => {
      palavra.palavra.split('').forEach((letra, index) => {
        const x = palavra.direcao === 'horizontal' ? palavra.x + index : palavra.x;
        const y = palavra.direcao === 'vertical' ? palavra.y + index : palavra.y;
        const key = `${x},${y}`;
        novasEntradas[key] = '';
      });
    });
    setEntradas(novasEntradas);
  };

  const handleInputChange = (x: number, y: number, valor: string) => {
    const chave = `${x},${y}`;
    const novasEntradas = { ...entradas, [chave]: valor.toUpperCase() };
    setEntradas(novasEntradas);
    verificarPalavras(novasEntradas);
  };

  const verificarPalavras = (novasEntradas: Record<string, string>) => {
    if (!jogo) return;

    const novasPalavrasEncontradas = [...palavrasEncontradas];

    jogo.palavras.forEach(palavraPos => {
      const { palavra, x, y, direcao } = palavraPos;
      
      let encontrada = true;
      for (let i = 0; i < palavra.length; i++) {
        const posX = direcao === 'horizontal' ? x + i : x;
        const posY = direcao === 'vertical' ? y + i : y;
        const chave = `${posX},${posY}`;
        
        if (novasEntradas[chave] !== palavra[i]) {
          encontrada = false;
          break;
        }
      }
      
      if (encontrada && !novasPalavrasEncontradas.includes(palavra)) {
        novasPalavrasEncontradas.push(palavra);
        toast.success(`Parabéns! Você encontrou a palavra ${palavra}!`);
      }
    });

    if (novasPalavrasEncontradas.length > palavrasEncontradas.length) {
      setPalavrasEncontradas(novasPalavrasEncontradas);
      
      if (novasPalavrasEncontradas.length === jogo.palavras.length) {
        toast.success('Parabéns! Você completou o jogo de palavras cruzadas!', {
          duration: 5000
        });
      }
    }
  };

  const handleShowDica = (palavra: string) => {
    if (jogo) {
      setDicaAtual(jogo.dicas[palavra]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner className="text-primary" />
      </div>
    );
  }

  if (!jogo) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">Jogo não disponível</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-6 bg-glass-darker border-white/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient bg-gradient-to-r from-primary to-purple-400">
              <Grid3X3 className="h-5 w-5 text-primary" />
              {jogo.titulo}
            </CardTitle>
            <p className="text-muted-foreground">{jogo.descricao}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-medium text-primary">Progresso:</p>
                <p className="text-sm text-muted-foreground">
                  {palavrasEncontradas.length}/{jogo.palavras.length} palavras
                </p>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(palavrasEncontradas.length / jogo.palavras.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Palavras cruzadas grid */}
            <div className="border border-white/10 rounded-lg p-4 bg-black/20 mb-6 overflow-x-auto">
              <div 
                className="grid gap-1" 
                style={{ 
                  gridTemplateColumns: `repeat(${jogo.grade_tamanho.largura}, minmax(30px, 1fr))`,
                  gridTemplateRows: `repeat(${jogo.grade_tamanho.altura}, 30px)`
                }}
              >
                {Array.from({ length: jogo.grade_tamanho.altura }).map((_, y) => (
                  Array.from({ length: jogo.grade_tamanho.largura }).map((_, x) => {
                    const key = `${x},${y}`;
                    const temCelula = entradas.hasOwnProperty(key);
                    
                    return (
                      <div key={key} className={`${temCelula ? 'border border-white/20 bg-glass' : ''} flex items-center justify-center`}>
                        {temCelula && (
                          <input
                            type="text"
                            maxLength={1}
                            value={entradas[key]}
                            onChange={(e) => handleInputChange(x, y, e.target.value)}
                            className="w-full h-full text-center uppercase font-medium bg-transparent text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            {/* Palavras e dicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-glass rounded-lg p-4 border border-white/10">
                <h3 className="font-medium mb-4 text-primary">Palavras:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {jogo.palavras.map(({ palavra }) => (
                    <motion.div 
                      key={palavra} 
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Badge 
                        variant={palavrasEncontradas.includes(palavra) ? "default" : "outline"}
                        className={palavrasEncontradas.includes(palavra) ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600" : "border-white/20"}
                      >
                        {palavrasEncontradas.includes(palavra) ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <span className="mr-1">•</span>
                        )}
                        {palavra}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hover:bg-white/10"
                        onClick={() => handleShowDica(palavra)}
                      >
                        <Info className="h-3 w-3 text-primary" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-glass rounded-lg p-4 border border-white/10">
                <h3 className="font-medium mb-2 text-primary">Dica:</h3>
                <div className="min-h-[100px] bg-black/20 p-4 rounded-lg border border-white/5">
                  {dicaAtual ? dicaAtual : (
                    <span className="text-muted-foreground">
                      Clique no ícone <Info className="h-3 w-3 inline" /> ao lado de uma palavra para ver sua dica.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
