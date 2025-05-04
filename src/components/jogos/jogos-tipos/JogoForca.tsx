
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlarmClock, HelpCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface JogoForca {
  id: string;
  titulo: string;
  descricao: string;
  nivel_dificuldade: string;
  area_direito: string;
  palavras: string[];
  dicas: Record<string, string>;
  max_tentativas: number;
}

interface JogoForcaProps {
  gameId: string;
}

export const JogoForca = ({ gameId }: JogoForcaProps) => {
  const [jogo, setJogo] = useState<JogoForca | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [palavraAtual, setPalavraAtual] = useState('');
  const [dicaAtual, setDicaAtual] = useState('');
  const [letrasUsadas, setLetrasUsadas] = useState<string[]>([]);
  const [palavraVisivel, setPalavraVisivel] = useState<string[]>([]);
  const [tentativasRestantes, setTentativasRestantes] = useState(6);
  const [gameOver, setGameOver] = useState(false);
  const [vitoria, setVitoria] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  
  const alfabeto = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

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

        // Busca detalhes específicos deste jogo na tabela jogos_forca
        const { data, error } = await supabase
          .from('jogos_forca')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          const jogoData = data[0] as JogoForca;
          setJogo(jogoData);
          
          if (jogoData.palavras.length > 0) {
            const palavra = jogoData.palavras[0];
            iniciarNovoJogo(palavra, jogoData.dicas[palavra], 0, jogoData.max_tentativas);
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

  const iniciarNovoJogo = (palavra: string, dica: string, indice: number, maxTentativas: number) => {
    setPalavraAtual(palavra);
    setDicaAtual(dica);
    setLetrasUsadas([]);
    setPalavraVisivel(Array(palavra.length).fill('_'));
    setTentativasRestantes(maxTentativas);
    setGameOver(false);
    setVitoria(false);
    setIndiceAtual(indice);
  };

  const handleLetraSelecionada = (letra: string) => {
    if (gameOver || letrasUsadas.includes(letra)) return;
    
    const novasLetrasUsadas = [...letrasUsadas, letra];
    setLetrasUsadas(novasLetrasUsadas);
    
    const palavra = palavraAtual;
    const novasPosicoes = [...palavraVisivel];
    let acertou = false;
    
    // Verifica se a letra está na palavra
    for (let i = 0; i < palavra.length; i++) {
      if (palavra[i] === letra) {
        novasPosicoes[i] = letra;
        acertou = true;
      }
    }
    
    setPalavraVisivel(novasPosicoes);
    
    // Se errou, diminui tentativas
    if (!acertou) {
      const novasTentativas = tentativasRestantes - 1;
      setTentativasRestantes(novasTentativas);
      
      if (novasTentativas <= 0) {
        setGameOver(true);
        toast.error(`Você perdeu! A palavra era: ${palavra}`);
      }
    } else {
      // Verifica se ganhou
      if (!novasPosicoes.includes('_')) {
        setVitoria(true);
        setGameOver(true);
        toast.success('Parabéns! Você acertou a palavra!');
      }
    }
  };

  const proximaPalavra = () => {
    if (jogo) {
      const novoIndice = (indiceAtual + 1) % jogo.palavras.length;
      const novaPalavra = jogo.palavras[novoIndice];
      iniciarNovoJogo(novaPalavra, jogo.dicas[novaPalavra], novoIndice, jogo.max_tentativas);
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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-primary" />
            {jogo.titulo}
          </CardTitle>
          <p className="text-muted-foreground">{jogo.descricao}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center">
            {/* Imagem da Forca */}
            <div className="mb-6 bg-slate-100 p-4 rounded-lg">
              <motion.div 
                className="text-8xl font-bold text-red-500"
                animate={{
                  scale: gameOver && !vitoria ? [1, 1.1, 1] : 1
                }}
                transition={{ repeat: gameOver && !vitoria ? Infinity : 0, duration: 1 }}
              >
                {tentativasRestantes === 6 && '🙂'}
                {tentativasRestantes === 5 && '😐'}
                {tentativasRestantes === 4 && '😕'}
                {tentativasRestantes === 3 && '😟'}
                {tentativasRestantes === 2 && '😨'}
                {tentativasRestantes === 1 && '😰'}
                {tentativasRestantes === 0 && '😵'}
                {vitoria && '😄'}
              </motion.div>
              <div className="text-xs mt-2 text-muted-foreground">
                Tentativas restantes: {tentativasRestantes}
              </div>
            </div>
            
            {/* Palavra Oculta */}
            <div className="flex justify-center gap-2 my-6">
              {palavraVisivel.map((letra, index) => (
                <motion.div 
                  key={`${index}-${letra}`}
                  className="w-8 h-12 flex items-center justify-center border-b-2 border-primary mx-1 text-2xl font-bold"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {letra}
                </motion.div>
              ))}
            </div>
            
            {/* Dica */}
            <div className="mb-6 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <p className="font-medium">Dica:</p>
              </div>
              <p>{dicaAtual}</p>
            </div>
            
            {/* Alfabeto */}
            <div className="grid grid-cols-9 sm:grid-cols-13 gap-2 mb-6">
              {alfabeto.map((letra) => (
                <Button
                  key={letra}
                  variant={
                    letrasUsadas.includes(letra)
                      ? palavraAtual.includes(letra)
                        ? "default"
                        : "destructive"
                      : "outline"
                  }
                  size="sm"
                  className="w-8 h-8 p-0"
                  disabled={letrasUsadas.includes(letra) || gameOver}
                  onClick={() => handleLetraSelecionada(letra)}
                >
                  {letra}
                </Button>
              ))}
            </div>
            
            {/* Status do Jogo */}
            {gameOver && (
              <motion.div
                className={`p-4 rounded-lg mb-4 ${vitoria ? 'bg-green-100' : 'bg-red-100'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className={`font-bold ${vitoria ? 'text-green-700' : 'text-red-700'}`}>
                  {vitoria 
                    ? 'Parabéns! Você acertou a palavra!' 
                    : `Game over! A palavra era: ${palavraAtual}`}
                </p>
              </motion.div>
            )}
            
            <Button 
              variant="outline"
              onClick={proximaPalavra}
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              {gameOver ? 'Próxima Palavra' : 'Pular Palavra'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
