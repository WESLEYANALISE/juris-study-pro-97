
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX 
} from "lucide-react";

interface TextToSpeechProps {
  text: string;
  language?: string;
  voice?: string;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export function TextToSpeech({ 
  text, 
  language = 'pt-BR',
  voice = '',
  onPlayingChange 
}: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [currentSegment, setCurrentSegment] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Dividir texto em segmentos menores para melhor performance
  const textSegments = text
    .replace(/\.(?=\s|$)/g, '.|') // Dividir por pontos
    .replace(/\?(?=\s|$)/g, '?|') // Dividir por interrogações
    .replace(/\!(?=\s|$)/g, '!|') // Dividir por exclamações
    .split('|')
    .filter(segment => segment.trim() !== '');

  // Inicializar vozes disponíveis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        const preferredVoice = voices.find(v => 
          v.lang.includes(language) && 
          (voice ? v.name.includes(voice) : true)
        );
        
        if (preferredVoice) {
          setSelectedVoice(preferredVoice);
        } else if (voices.length > 0) {
          // Tentar encontrar qualquer voz com a língua correta
          const langVoice = voices.find(v => v.lang.includes(language));
          setSelectedVoice(langVoice || voices[0]);
        }
      };
      
      // Carregar vozes e configurar event listener
      loadVoices();
      
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    
    return () => {
      stopSpeaking();
    };
  }, [language, voice]);

  // Configurar a síntese de voz
  const setupUtterance = (text: string) => {
    if (!window.speechSynthesis) return null;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = language;
    utterance.volume = isMuted ? 0 : volume / 100;
    utterance.rate = rate;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onPlayingChange?.(true);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayingChange?.(false);
      
      // Avançar para o próximo segmento
      if (currentSegment < textSegments.length - 1) {
        setCurrentSegment(prev => prev + 1);
        speakSegment(currentSegment + 1);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      onPlayingChange?.(false);
    };
    
    return utterance;
  };

  // Função para falar um segmento específico
  const speakSegment = (segmentIndex: number) => {
    if (!window.speechSynthesis || segmentIndex >= textSegments.length) return;
    
    const segment = textSegments[segmentIndex];
    utteranceRef.current = setupUtterance(segment);
    
    if (utteranceRef.current) {
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  // Função para iniciar/pausar a narração
  const togglePlay = () => {
    if (!window.speechSynthesis) return;
    
    if (isPlaying && !isPaused) {
      // Pausar
      window.speechSynthesis.pause();
      setIsPaused(true);
      onPlayingChange?.(false);
    } else if (isPaused) {
      // Retomar
      window.speechSynthesis.resume();
      setIsPaused(false);
      onPlayingChange?.(true);
    } else {
      // Iniciar
      speakSegment(currentSegment);
    }
  };

  // Parar a narração
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      onPlayingChange?.(false);
    }
  };

  // Navegação entre segmentos
  const skipBackward = () => {
    stopSpeaking();
    setCurrentSegment(prev => Math.max(0, prev - 1));
    setTimeout(() => speakSegment(currentSegment), 100);
  };

  const skipForward = () => {
    stopSpeaking();
    setCurrentSegment(prev => Math.min(textSegments.length - 1, prev + 1));
    setTimeout(() => speakSegment(currentSegment), 100);
  };

  // Atualizar volume
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    
    if (utteranceRef.current && window.speechSynthesis) {
      // Infelizmente, não podemos atualizar o volume de uma utterance em andamento
      // Precisamos recriar se quisermos mudar o volume
      const currentlyPlaying = isPlaying && !isPaused;
      
      if (currentlyPlaying) {
        window.speechSynthesis.cancel();
        speakSegment(currentSegment);
      }
    }
  };

  // Toggle mudo
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (utteranceRef.current && window.speechSynthesis) {
      // Mesmo problema para atualizar o mute
      const currentlyPlaying = isPlaying && !isPaused;
      
      if (currentlyPlaying) {
        window.speechSynthesis.cancel();
        speakSegment(currentSegment);
      }
    }
  };

  // Atualizar velocidade de reprodução
  const handleRateChange = (newRate: number[]) => {
    setRate(newRate[0]);
    
    if (utteranceRef.current && window.speechSynthesis) {
      const currentlyPlaying = isPlaying && !isPaused;
      
      if (currentlyPlaying) {
        window.speechSynthesis.cancel();
        speakSegment(currentSegment);
      }
    }
  };

  // Limpar na desmontagem
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!('speechSynthesis' in window)) {
    return (
      <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
        Seu navegador não suporta Text-to-Speech.
      </div>
    );
  }

  return (
    <div className="bg-card p-3 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipBackward}
            disabled={currentSegment <= 0 || (!isPlaying && !isPaused)}
            className="h-8 w-8"
          >
            <SkipBack size={16} />
          </Button>
          
          <Button 
            variant={isPlaying && !isPaused ? "secondary" : "default"} 
            size="icon" 
            onClick={togglePlay}
            className="h-8 w-8"
          >
            {isPlaying && !isPaused ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipForward}
            disabled={currentSegment >= textSegments.length - 1 || (!isPlaying && !isPaused)}
            className="h-8 w-8"
          >
            <SkipForward size={16} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-[140px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            disabled={isMuted}
            className="w-[100px]"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-16">Velocidade:</span>
        <Slider
          value={[rate]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={handleRateChange}
          className="flex-1"
        />
        <span className="text-xs font-mono w-10 text-right">{rate.toFixed(1)}x</span>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
        <span>Segmento: {currentSegment + 1} / {textSegments.length}</span>
        <span>Voz: {selectedVoice?.name || 'Padrão'}</span>
      </div>
    </div>
  );
}
