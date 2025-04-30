
import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from '@/hooks/use-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDuration } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerMobileProps {
  audioUrl: string;
  title: string;
  id: string;
  thumbnail?: string;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export function AudioPlayerMobile({ 
  audioUrl, 
  title, 
  id, 
  thumbnail, 
  onEnded, 
  onError 
}: AudioPlayerMobileProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const { user } = useAuth();

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const handleCanPlay = () => {
      setAudioReady(true);
      setDuration(audio.duration);
      console.log("Audio can play, duration:", audio.duration);
    };
    
    const handleError = (e: any) => {
      console.error("Audio error:", e);
      setErrorState(`Erro ao carregar áudio: ${e.target.error?.message || 'Desconhecido'}`);
      setIsPlaying(false);
      if (onError) onError(e);
      toast.error("Não foi possível reproduzir este áudio");
    };
    
    const handleEnded = () => {
      console.log("Audio ended");
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
      updateProgress(true);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log("Audio metadata loaded, duration:", audio.duration);
    };
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Load saved progress
    if (user) {
      loadProgress();
    }
    
    return () => {
      audio.pause();
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, [audioUrl, user]);

  // Load saved progress from Supabase
  const loadProgress = async () => {
    if (!user || !audioRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('user_podcast_progress')
        .select('progress_seconds, completed')
        .eq('podcast_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading progress:', error);
        return;
      }
      
      if (data) {
        setCurrentTime(data.progress_seconds);
        audioRef.current.currentTime = data.progress_seconds;
      }
    } catch (err) {
      console.error('Error loading podcast progress:', err);
    }
  };

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
          setErrorState(`Reprodução falhou: ${error?.message || 'Desconhecido'}`);
          toast.error("Erro ao reproduzir o áudio");
        });
      }
      
      // Update progress every second
      progressTimerRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      audioRef.current.pause();
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    }
  }, [isPlaying]);

  // Sync audio mute state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Save progress periodically and on unmount
  useEffect(() => {
    const saveProgressInterval = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        updateProgress();
      }
    }, 10000); // Save every 10 seconds while playing

    return () => {
      clearInterval(saveProgressInterval);
      if (currentTime > 0) {
        updateProgress();
      }
    };
  }, [currentTime, isPlaying]);

  // Update progress in Supabase
  const updateProgress = async (completed = false) => {
    if (!user || currentTime <= 0) return;
    
    try {
      const { error } = await supabase
        .from('user_podcast_progress')
        .upsert({
          user_id: user.id,
          podcast_id: id,
          progress_seconds: Math.floor(currentTime),
          completed,
          last_played_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving progress:', error);
      }
    } catch (err) {
      console.error('Error saving podcast progress:', err);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = audioRef.current.currentTime + seconds;
    audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
    setCurrentTime(audioRef.current.currentTime);
  };

  const retryPlayback = () => {
    if (!audioRef.current) return;
    
    setErrorState(null);
    audioRef.current.load();
    
    setTimeout(() => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Retry playback failed:", error);
              setErrorState(`Tentativa de reprodução falhou: ${error?.message || 'Desconhecido'}`);
              toast.error("Não foi possível reproduzir este áudio");
            });
        }
      }
    }, 1000);
  };

  return (
    <div className="bg-card border border-primary/10 rounded-lg overflow-hidden shadow-md">
      {/* Error State */}
      {errorState && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm">
          <p>{errorState}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full"
            onClick={retryPlayback}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Player Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-medium text-sm line-clamp-1 mb-2">{title}</h3>
        
        {/* Progress Bar */}
        <div className="space-y-1 mb-3">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            disabled={!audioReady}
            className="cursor-pointer"
          />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration || 0)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => skip(-10)}
            disabled={!audioReady}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <motion.div className="relative">
            <Button 
              variant={isPlaying ? "default" : "outline"} 
              size="icon" 
              className={`h-10 w-10 rounded-full ${isPlaying ? 'bg-primary' : 'border-2 border-primary bg-primary/10'}`}
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!audioReady && !errorState}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? "pause" : "play"}
                  initial={{ scale: 0, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.2 }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
            
            {!audioReady && !errorState && (
              <motion.div 
                className="absolute -inset-1 rounded-full opacity-20 bg-primary blur-sm"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => skip(10)}
            disabled={!audioReady}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full ml-1"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!audioReady}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
