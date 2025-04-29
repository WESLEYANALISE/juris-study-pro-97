
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, TimerIcon, Lightbulb } from 'lucide-react';

interface QuizJogoProps {
  gameId: string;
}

interface Question {
  id: string;
  pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: string;
  explicacao?: string;
  categoria: string;
  area: string;
}

export const QuizJogo = ({ gameId }: QuizJogoProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('jogos_quiz_perguntas')
          .select('*')
          .limit(5)
          .order('created_at');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          // Load test questions if no questions are available
          setQuestions([
            {
              id: '1',
              pergunta: 'Qual princípio do direito determina que ninguém será obrigado a fazer ou deixar de fazer algo senão em virtude de lei?',
              opcao_a: 'Princípio da Legalidade',
              opcao_b: 'Princípio da Impessoalidade',
              opcao_c: 'Princípio da Moralidade',
              opcao_d: 'Princípio da Publicidade',
              resposta_correta: 'A',
              explicacao: 'O princípio da legalidade está previsto no art. 5º, II, da Constituição Federal, e determina que ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.',
              categoria: 'Constitucional',
              area: 'Direito Constitucional'
            },
            {
              id: '2',
              pergunta: 'Qual é o prazo prescricional para ação de reparação civil?',
              opcao_a: '1 ano',
              opcao_b: '3 anos',
              opcao_c: '5 anos',
              opcao_d: '10 anos',
              resposta_correta: 'B',
              explicacao: 'Conforme o art. 206, § 3º, V, do Código Civil, prescreve em 3 anos a pretensão de reparação civil.',
              categoria: 'Civil',
              area: 'Direito Civil'
            },
            {
              id: '3',
              pergunta: 'O que é habeas corpus?',
              opcao_a: 'Ação para proteger direito líquido e certo não amparado por habeas corpus ou habeas data',
              opcao_b: 'Ação para assegurar o conhecimento de informações relativas à pessoa do impetrante',
              opcao_c: 'Remédio constitucional para proteger pessoas contra violência ou coação em sua liberdade de locomoção',
              opcao_d: 'Instrumento processual para anular atos administrativos',
              resposta_correta: 'C',
              explicacao: 'O habeas corpus é um remédio constitucional previsto no art. 5º, LXVIII, da CF/88, que visa proteger o direito de ir e vir do indivíduo.',
              categoria: 'Processual',
              area: 'Direito Processual'
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        toast.error('Não foi possível carregar as perguntas do quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  useEffect(() => {
    if (!gameStarted || isAnswered || gameFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, isAnswered, gameFinished]);
  
  const handleTimeOut = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      toast.error('Tempo esgotado!');
      saveAnswer(null);
    }
  };
  
  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setTimeLeft(30);
  };
  
  const saveAnswer = async (option: string | null) => {
    if (!user || !questions[currentQuestionIndex]) return;
    
    const question = questions[currentQuestionIndex];
    const correct = option === question.resposta_correta;
    
    try {
      setIsSubmitting(true);
      
      // Save answer to database
      const { error } = await supabase
        .from('jogos_quiz_respostas')
        .insert({
          user_id: user.id,
          pergunta_id: question.id,
          resposta_selecionada: option || 'X',
          acertou: correct,
          tempo_resposta: 30 - timeLeft
        });
      
      if (error) throw error;
      
      if (correct) {
        // Calculate points based on time left
        const pointsGained = 10 + Math.floor(timeLeft * 0.5);
        setScore(prev => prev + pointsGained);
      }
      
      // Update user statistics
      await updateUserStats(correct);
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateUserStats = async (correct: boolean) => {
    if (!user) return;
    
    try {
      // Check if stats exist for this game
      const { data, error } = await supabase
        .from('jogos_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('jogo_id', gameId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      const currentStats = data || {
        user_id: user.id,
        jogo_id: gameId,
        pontuacao: 0,
        partidas_jogadas: 0,
        partidas_vencidas: 0,
        melhor_resultado: 0
      };
      
      // Update stats
      if (data) {
        await supabase
          .from('jogos_user_stats')
          .update({
            pontuacao: currentStats.pontuacao + (correct ? 1 : 0),
            partidas_jogadas: currentStats.partidas_jogadas + 1,
            ultimo_acesso: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('jogo_id', gameId);
      } else {
        await supabase
          .from('jogos_user_stats')
          .insert({
            user_id: user.id,
            jogo_id: gameId,
            pontuacao: correct ? 1 : 0,
            partidas_jogadas: 1,
            partidas_vencidas: 0,
            melhor_resultado: 0
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };
  
  const handleAnswerSelect = async (option: string) => {
    if (isAnswered || isSubmitting) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const isCorrect = option === questions[currentQuestionIndex].resposta_correta;
    await saveAnswer(option);
    
    if (isCorrect) {
      toast.success('Resposta correta!');
    } else {
      toast.error('Resposta incorreta!');
    }
  };
  
  const handleNextQuestion = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      // Quiz finished
      finishGame();
    }
  };
  
  const finishGame = async () => {
    setGameFinished(true);
    
    if (!user) return;
    
    try {
      // Update leaderboard
      await supabase
        .from('jogos_leaderboards')
        .insert({
          user_id: user.id,
          jogo_id: gameId,
          pontuacao: score
        });
      
      // Check for badges
      if (score >= 30) {
        // Award perfect score badge
        await supabase
          .from('jogos_user_badges')
          .insert({
            user_id: user.id,
            jogo_id: gameId,
            badge_nome: 'Quiz Master',
            badge_descricao: 'Conseguiu uma pontuação acima de 30 no Quiz Jurídico',
            badge_icone: 'trophy'
          })
          .onConflict(['user_id', 'jogo_id', 'badge_nome'])
          .ignore();
      }
    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (gameFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Quiz Concluído!</h2>
            <p className="text-muted-foreground mb-6">
              Sua pontuação final foi:
            </p>
            <div className="text-5xl font-bold text-primary mb-4">{score}</div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button onClick={() => startGame()} size="lg">
              Jogar Novamente
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz de Direito</h2>
        <p className="text-muted-foreground mb-6 max-w-lg">
          Teste seus conhecimentos jurídicos respondendo perguntas de múltipla escolha sobre diversos temas do Direito. Quanto mais rápido responder, mais pontos você ganha!
        </p>
        <Button onClick={() => startGame()} size="lg">
          Iniciar Quiz
        </Button>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
          Questão {currentQuestionIndex + 1}/{questions.length}
        </div>
        
        <div className="flex items-center gap-2">
          <TimerIcon className="h-4 w-4" />
          <div className={`text-sm font-medium ${timeLeft < 10 ? 'text-red-500' : ''}`}>
            {timeLeft}s
          </div>
        </div>
        
        <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
          Pontos: {score}
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-2">{currentQuestion.pergunta}</h3>
        <div className="text-xs text-muted-foreground mb-2">
          Área: {currentQuestion.area}
        </div>
      </div>
      
      <div className="space-y-3">
        {['A', 'B', 'C', 'D'].map((option) => (
          <button
            key={option}
            onClick={() => handleAnswerSelect(option)}
            disabled={isAnswered || isSubmitting}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              isAnswered 
                ? option === currentQuestion.resposta_correta
                  ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-800'
                  : option === selectedOption
                    ? 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-800'
                    : 'bg-card border'
                : 'hover:border-primary/50 bg-card border'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 flex items-center justify-center rounded-full border mr-3 ${
                isAnswered && option === currentQuestion.resposta_correta
                  ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-300'
                  : isAnswered && option === selectedOption
                    ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-300'
                    : 'bg-muted border-input'
              }`}>
                {option}
              </div>
              
              <div className="flex-1">
                {(currentQuestion as any)[`opcao_${option.toLowerCase()}`]}
              </div>
              
              {isAnswered && (
                <div className="ml-2">
                  {option === currentQuestion.resposta_correta && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {option === selectedOption && option !== currentQuestion.resposta_correta && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {isAnswered && currentQuestion.explicacao && !showExplanation && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowExplanation(true)}
            className="flex items-center"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Ver Explicação
          </Button>
        </div>
      )}
      
      {isAnswered && showExplanation && currentQuestion.explicacao && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-muted/50 border rounded-lg"
        >
          <div className="flex items-start">
            <Lightbulb className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Explicação</h4>
              <p className="text-sm text-muted-foreground">{currentQuestion.explicacao}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {isAnswered && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
          </Button>
        </div>
      )}
    </div>
  );
};
