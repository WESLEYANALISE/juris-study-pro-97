
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, HelpCircle, Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface JogoPalavras {
  id: string;
  titulo: string;
  descricao: string;
  nivel_dificuldade: string;
  area_direito: string;
  palavras: string[];
  grade: string[];
  dicas: Record<string, string>;
}

interface CacaPalavrasProps {
  gameId: string;
}

export const CacaPalavras = ({ gameId }: CacaPalavrasProps) => {
  const [jogo, setJogo] = useState<JogoPalavras | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [palavrasEncontradas, setPalavrasEncontradas] = useState<string[]>([]);
  const [palavraSelecionada, setPalavraSelecionada] = useState<string>('');
  const [mostrarDicas, setMostrarDicas] = useState(false);

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

        // Busca detalhes específicos deste jogo na tabela jogos_caca_palavras
        const { data, error } = await supabase
          .from('jogos_caca_palavras')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setJogo(data[0] as JogoPalavras);
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

  const handleCheckPalavra = () => {
    if (!palavraSelecionada.trim()) {
      toast.warning('Digite uma palavra primeiro');
      return;
    }

    const palavraFormatada = palavraSelecionada.trim().toUpperCase();
    
    if (jogo?.palavras.includes(palavraFormatada)) {
      if (palavrasEncontradas.includes(palavraFormatada)) {
        toast.info('Você já encontrou esta palavra');
        return;
      }
      
      setPalavrasEncontradas([...palavrasEncontradas, palavraFormatada]);
      setPalavraSelecionada('');
      toast.success('Palavra encontrada!');
      
      // Verifica se todas as palavras foram encontradas
      if (palavrasEncontradas.length + 1 === jogo?.palavras.length) {
        toast.success('Parabéns! Você encontrou todas as palavras!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />
        });
      }
    } else {
      toast.error('Esta palavra não está na lista');
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
            <Search className="h-5 w-5 text-primary" />
            {jogo.titulo}
          </CardTitle>
          <p className="text-muted-foreground">{jogo.descricao}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-4 text-lg font-medium">Grade de Letras:</div>
            <div className="border rounded-lg p-4 bg-slate-50 mb-6">
              <div className="grid grid-cols-1 gap-1 font-mono text-center">
                {jogo.grade.map((linha, index) => (
                  <div key={index} className="flex justify-center">
                    {linha.split('').map((letra, idx) => (
                      <motion.div
                        key={`${index}-${idx}`}
                        className="w-8 h-8 flex items-center justify-center bg-white border m-0.5 rounded shadow-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        {letra}
                      </motion.div>
                    ))}
                  </div>
                ))}
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

            <div className="flex flex-wrap gap-2 mb-6">
              {jogo.palavras.map((palavra) => (
                <Badge 
                  key={palavra} 
                  variant={palavrasEncontradas.includes(palavra) ? "default" : "outline"}
                  className={palavrasEncontradas.includes(palavra) 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "text-muted-foreground"}
                >
                  {palavrasEncontradas.includes(palavra) ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <span className="mr-1">•</span>
                  )}
                  {palavrasEncontradas.includes(palavra) ? palavra : "?????"}
                </Badge>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  value={palavraSelecionada}
                  onChange={(e) => setPalavraSelecionada(e.target.value)}
                  placeholder="Digite uma palavra que encontrou..."
                  className="w-full border rounded-md px-3 py-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCheckPalavra()}
                />
              </div>
              <Button onClick={handleCheckPalavra}>Verificar</Button>
            </div>
          </div>

          <div>
            <Button 
              variant="outline" 
              onClick={() => setMostrarDicas(!mostrarDicas)}
              className="w-full flex items-center justify-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {mostrarDicas ? 'Ocultar Dicas' : 'Mostrar Dicas'}
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
                  {jogo.palavras.map((palavra) => (
                    <li key={palavra} className="text-sm">
                      <span className="font-medium">{palavrasEncontradas.includes(palavra) ? palavra : '?????'}</span>
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
