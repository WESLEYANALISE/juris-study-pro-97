
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, HelpCircle, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PalavraPos {
  palavra: string;
  x: number;
  y: number;
  direcao: 'horizontal' | 'vertical';
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
  const [palavrasEncontradas, setPalavrasEncontradas] = useState<string[]>([]);
  const [palavraAtual, setPalavraAtual] = useState<string>('');
  const [dicaAtual, setDicaAtual] = useState<string>('');
  const [mostrarDicas, setMostrarDicas] = useState(false);
  const [tentativa, setTentativa] = useState<string>('');

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
          const jogoData = data[0] as JogoPalavrasCruzadas;
          setJogo(jogoData);
          
          // Inicializa a grade vazia
          const novaGrade: string[][] = [];
          for (let y = 0; y < jogoData.grade_tamanho.altura; y++) {
            novaGrade[y] = [];
            for (let x = 0; x < jogoData.grade_tamanho.largura; x++) {
              novaGrade[y][x] = '';
            }
          }
          
          // Preenche a grade com as palavras encontradas
          setGrade(novaGrade);
          
          // Define a primeira dica ativa
          if (jogoData.palavras.length > 0) {
            const primeiraPalavra = jogoData.palavras[0].palavra;
            setPalavraAtual(primeiraPalavra);
            setDicaAtual(jogoData.dicas[primeiraPalavra] || '');
          }
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

  useEffect(() => {
    if (jogo && palavrasEncontradas.length > 0) {
      // Atualizar a grade com as palavras encontradas
      const novaGrade: string[][] = [];
      for (let y = 0; y < jogo.grade_tamanho.altura; y++) {
        novaGrade[y] = [];
        for (let x = 0; x < jogo.grade_tamanho.largura; x++) {
          novaGrade[y][x] = '';
        }
      }

      jogo.palavras.forEach(({ palavra, x, y, direcao }) => {
        if (palavrasEncontradas.includes(palavra)) {
          for (let i = 0; i < palavra.length; i++) {
            if (direcao === 'horizontal') {
              novaGrade[y][x + i] = palavra[i];
            } else {
              novaGrade[y + i][x] = palavra[i];
            }
          }
        }
      });

      setGrade(novaGrade);
    }
  }, [jogo, palavrasEncontradas]);

  const handleVerificarPalavra = () => {
    if (!tentativa.trim()) {
      toast.warning('Digite uma palavra primeiro');
      return;
    }

    const tentativaFormatada = tentativa.trim().toUpperCase();
    
    if (tentativaFormatada === palavraAtual) {
      setPalavrasEncontradas([...palavrasEncontradas, palavraAtual]);
      setTentativa('');
      toast.success('Palavra correta!');
      
      // Avança para a próxima palavra não encontrada
      if (jogo) {
        const proximasPalavras = jogo.palavras.filter(p => !palavrasEncontradas.includes(p.palavra) && p.palavra !== palavraAtual);
        if (proximasPalavras.length > 0) {
          const proxima = proximasPalavras[0].palavra;
          setPalavraAtual(proxima);
          setDicaAtual(jogo.dicas[proxima] || '');
        } else {
          // Todas as palavras foram encontradas
          toast.success('Parabéns! Você completou as palavras cruzadas!');
        }
      }
    } else {
      toast.error('Palavra incorreta, tente novamente');
    }
  };

  const selecionarPalavra = (novaPalavra: string) => {
    if (jogo) {
      setPalavraAtual(novaPalavra);
      setDicaAtual(jogo.dicas[novaPalavra] || '');
      setTentativa('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner />
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

  const totalPalavras = jogo.palavras.length;
  const progresso = Math.round((palavrasEncontradas.length / totalPalavras) * 100);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            {jogo.titulo}
          </CardTitle>
          <p className="text-muted-foreground">{jogo.descricao}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-4 text-lg font-medium">Palavras Cruzadas:</div>
            <div className="border rounded-lg p-4 bg-slate-50 mb-6 overflow-x-auto">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${jogo.grade_tamanho.largura}, minmax(2rem, 1fr))` }}>
                {grade.map((linha, y) => 
                  linha.map((letra, x) => {
                    // Verifica se esta posição é o início de alguma palavra
                    const palavraInicio = jogo.palavras.find(p => 
                      (p.x === x && p.y === y) || 
                      // Verifica se esta célula faz parte de alguma palavra
                      (p.direcao === 'horizontal' && p.y === y && x >= p.x && x < p.x + p.palavra.length) ||
                      (p.direcao === 'vertical' && p.x === x && y >= p.y && y < p.y + p.palavra.length)
                    );

                    return (
                      <div 
                        key={`${y}-${x}`} 
                        className={`w-8 h-8 flex items-center justify-center border m-0.5 rounded ${
                          palavraInicio ? 'bg-white' : 'bg-gray-200'
                        }`}
                      >
                        {letra}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-medium">Progresso: {progresso}%</p>
                <p className="text-sm text-muted-foreground">
                  {palavrasEncontradas.length}/{totalPalavras} palavras
                </p>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {jogo.palavras.map(({ palavra }) => (
                  <Badge 
                    key={palavra} 
                    variant={palavrasEncontradas.includes(palavra) ? "default" : palavra === palavraAtual ? "secondary" : "outline"}
                    className={`cursor-pointer ${
                      palavrasEncontradas.includes(palavra) 
                        ? "bg-green-500 hover:bg-green-600" 
                        : palavra === palavraAtual
                          ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                          : "text-muted-foreground hover:bg-slate-100"
                    }`}
                    onClick={() => !palavrasEncontradas.includes(palavra) && selecionarPalavra(palavra)}
                  >
                    {palavrasEncontradas.includes(palavra) ? (
                      <Check className="mr-1 h-3 w-3" />
                    ) : (
                      <span className="mr-1">•</span>
                    )}
                    {palavrasEncontradas.includes(palavra) ? palavra : `${palavra.length} letras`}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                <p className="font-medium mb-2">Dica atual:</p>
                <p>{dicaAtual}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={tentativa}
                    onChange={(e) => setTentativa(e.target.value)}
                    placeholder={`Digite a palavra (${palavraAtual.length} letras)`}
                    className="w-full border rounded-md px-3 py-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerificarPalavra()}
                  />
                </div>
                <Button onClick={handleVerificarPalavra}>Verificar</Button>
              </div>
            </div>
          </div>

          <div>
            <Button 
              variant="outline" 
              onClick={() => setMostrarDicas(!mostrarDicas)}
              className="w-full flex items-center justify-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {mostrarDicas ? 'Ocultar Todas as Dicas' : 'Mostrar Todas as Dicas'}
            </Button>
            
            {mostrarDicas && (
              <motion.div 
                className="mt-4 border rounded-lg p-4 bg-slate-50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-medium mb-2">Dicas:</h4>
                <ul className="space-y-2">
                  {jogo.palavras.map(({ palavra }) => (
                    <li key={palavra} className="text-sm flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        palavrasEncontradas.includes(palavra) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {palavrasEncontradas.includes(palavra) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <span className="font-medium">{palavrasEncontradas.includes(palavra) ? palavra : `${palavra.length} letras`}</span>
                      <span className="mx-2">-</span>
                      <span className="text-muted-foreground">{jogo.dicas[palavra]}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
