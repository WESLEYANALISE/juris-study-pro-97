
import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Download, 
  Heart, 
  Music 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  id: string;
  thumbnail?: string;
  duration?: number;
  onEnded?: () => void;
}

export function AudioPlayer({ audioUrl, title, id, thumbnail, duration, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const { user } = useAuth();

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
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
          if (audioRef.current) {
            audioRef.current.currentTime = data.progress_seconds;
          }
        }
      } catch (err) {
        console.error('Error loading podcast progress:', err);
      }
    };

    const checkFavorite = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_podcast_favorites')
          .select()
          .eq('podcast_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking favorite status:', error);
          return;
        }
        
        setIsFavorite(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    loadProgress();
    checkFavorite();
    
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, [id, user]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      
      // Apply saved time
      if (currentTime > 0) {
        audioRef.current.currentTime = currentTime;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, [audioUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
        toast.error("Erro ao reproduzir o áudio.");
      });
      
      // Start interval to update progress
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

  // Sync audio volume with state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync playback rate with state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Handle audio end event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
      updateProgress(true);
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

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

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Faça login para adicionar aos favoritos");
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('user_podcast_favorites')
          .delete()
          .eq('podcast_id', id)
          .eq('user_id', user.id);
        
        toast.success("Removido dos favoritos");
      } else {
        // Add to favorites
        await supabase
          .from('user_podcast_favorites')
          .insert({
            podcast_id: id,
            user_id: user.id
          });
        
        toast.success("Adicionado aos favoritos");
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite status:', err);
      toast.error("Erro ao atualizar favoritos");
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = audioRef.current.currentTime + seconds;
    audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
    setCurrentTime(audioRef.current.currentTime);
  };

  const maxDuration = duration || (audioRef.current?.duration || 0);

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Music className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          {/* Player controls */}
          <div className="flex-1 w-full">
            <div className="mb-2">
              <h3 className="font-medium text-base truncate" title={title}>{title}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => skip(-10)}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voltar 10 segundos</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                variant="default" 
                size="icon" 
                className="h-10 w-10" 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => skip(10)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Avançar 10 segundos</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1 mx-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">
                  {formatDuration(currentTime)}
                </span>
                
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={maxDuration || 100}
                    step={1}
                    onValueChange={handleProgressChange}
                  />
                </div>
                
                <span className="text-xs text-muted-foreground w-12">
                  {formatDuration(maxDuration)}
                </span>
              </div>
              
              {/* Extra controls */}
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMuted ? "Ativar som" : "Silenciar"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {playbackRate}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <DropdownMenuItem 
                        key={rate} 
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={toggleFavorite}
                      >
                        <Heart 
                          className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} 
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => window.open(audioUrl, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Baixar episódio</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Volume slider on larger screens */}
            <div className="hidden md:flex items-center gap-2 mt-2">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <div className="w-24">
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setVolume(value[0])}
                />
              </div>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
