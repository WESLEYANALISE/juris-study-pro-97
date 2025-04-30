
import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume, 
  Volume1, 
  Volume2, 
  VolumeX, 
  Download, 
  Heart, 
  Music, 
  Share2,
  Bookmark,
  List
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>(Array(32).fill(0));
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<{time: number, label: string}[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [id, user]);

  // Initialize audio element and audio context for visualizer
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  // Setup audio visualizer
  const setupAudioVisualizer = () => {
    if (!audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      const updateVisualizer = () => {
        if (!analyserRef.current || !isPlaying) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Convert the Uint8Array to normalized values for visualization
        const normalizedData = Array.from(dataArray).map(value => value / 255);
        setAudioFrequencyData(normalizedData);
        
        animationRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      if (isPlaying) {
        updateVisualizer();
      }
    } catch (error) {
      console.error('Error setting up audio visualizer:', error);
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
          toast.error("Erro ao reproduzir o áudio.");
        });
      }
      
      setupAudioVisualizer();
      
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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

  const addBookmark = () => {
    if (!audioRef.current) return;
    
    const newBookmark = {
      time: audioRef.current.currentTime,
      label: `Marcador ${bookmarks.length + 1}`
    };
    
    setBookmarks([...bookmarks, newBookmark]);
    setIsBookmarked(true);
    toast.success(`Marcador adicionado em ${formatDuration(newBookmark.time)}`);
  };

  const goToBookmark = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = audioRef.current.currentTime + seconds;
    audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
    setCurrentTime(audioRef.current.currentTime);
  };

  const shareEpisode = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `Ouça o episódio "${title}" no JusPedia Podcast`,
        url: window.location.href
      })
      .then(() => toast.success("Compartilhado com sucesso"))
      .catch((error) => console.error("Erro ao compartilhar:", error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success("Link copiado para área de transferência"))
        .catch(() => toast.error("Falha ao copiar link"));
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const maxDuration = duration || (audioRef.current?.duration || 0);

  return (
    <Card className="p-0 overflow-hidden bg-gradient-to-br from-background/90 to-background shadow-lg border-primary/10">
      <CardContent className="p-4">
        <motion.div 
          className="flex flex-col md:flex-row gap-4 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Thumbnail */}
          <motion.div 
            className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Music className="h-12 w-12 text-muted-foreground" />
            )}
          </motion.div>
          
          {/* Player controls */}
          <div className="flex-1 w-full">
            <div className="mb-2">
              <h3 className="font-medium text-lg truncate" title={title}>{title}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full" 
                        onClick={() => skip(-10)}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Voltar 10 segundos</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <motion.div 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button 
                  variant={isPlaying ? "default" : "default"} 
                  size="icon" 
                  className={`h-12 w-12 rounded-full ${isPlaying ? 'bg-primary' : 'border-2 border-primary bg-primary/10'}`}
                  onClick={() => setIsPlaying(!isPlaying)}
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
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
                
                {isPlaying && (
                  <motion.div 
                    className="absolute -inset-1 rounded-full opacity-20 bg-primary blur"
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full" 
                        onClick={() => skip(10)}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Avançar 10 segundos</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1 mx-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12 font-mono">
                  {formatDuration(currentTime)}
                </span>
                
                <div className="flex-1 relative">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={maxDuration || 100}
                    step={1}
                    onValueChange={handleProgressChange}
                    className="cursor-pointer"
                  />
                  
                  {/* Visualizer overlay */}
                  {isPlaying && (
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none flex justify-around items-center h-8 opacity-60">
                      {audioFrequencyData.slice(0, 32).map((value, index) => (
                        <motion.div
                          key={index}
                          className="w-[2px] bg-primary rounded-full"
                          style={{
                            height: `${Math.max(2, value * 20)}px`,
                          }}
                          animate={{
                            height: `${Math.max(2, value * 20)}px`,
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Bookmarks indicators */}
                  {bookmarks.map((bookmark, index) => (
                    <motion.div
                      key={index}
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-yellow-400 rounded-full cursor-pointer"
                      style={{ 
                        left: `${(bookmark.time / maxDuration) * 100}%`,
                      }}
                      whileHover={{ scale: 1.5 }}
                      onClick={() => goToBookmark(bookmark.time)}
                      title={`${bookmark.label} - ${formatDuration(bookmark.time)}`}
                    />
                  ))}
                </div>
                
                <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                  {formatDuration(maxDuration)}
                </span>
              </div>
              
              {/* Extra controls */}
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        className="relative" 
                        whileHover={{ scale: 1.1 }}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {getVolumeIcon()}
                        </Button>
                        
                        <AnimatePresence>
                          {showVolumeSlider && (
                            <motion.div 
                              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-3 bg-background border rounded-lg shadow-md z-10"
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="h-24 flex flex-col items-center justify-center">
                                <Slider
                                  value={[volume * 100]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => setVolume(value[0] / 100)}
                                  orientation="vertical"
                                  className="h-20"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMuted ? "Ativar som" : "Silenciar"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <DropdownMenuTrigger asChild>
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <Button variant="ghost" size="sm" className="text-xs font-mono">
                              {playbackRate}x
                            </Button>
                          </motion.div>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Velocidade de reprodução</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <DropdownMenuItem 
                        key={rate} 
                        onClick={() => setPlaybackRate(rate)}
                        className={playbackRate === rate ? "bg-muted" : ""}
                      >
                        {rate}x {playbackRate === rate && "✓"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${isFavorite ? 'text-red-500' : ''}`}
                          onClick={toggleFavorite}
                        >
                          <Heart 
                            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${isBookmarked ? 'text-yellow-500' : ''}`}
                          onClick={addBookmark}
                        >
                          <Bookmark 
                            className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                          />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Adicionar marcador</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={shareEpisode}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Compartilhar episódio</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => window.open(audioUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Baixar episódio</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${showPlaylist ? 'bg-muted' : ''}`}
                          onClick={() => setShowPlaylist(!showPlaylist)}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Fila de reprodução</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Bookmark list */}
            <AnimatePresence>
              {bookmarks.length > 0 && isBookmarked && (
                <motion.div 
                  className="mt-2 p-2 bg-muted/50 rounded-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-sm font-medium mb-1">Marcadores</h4>
                  <div className="flex flex-wrap gap-1">
                    {bookmarks.map((bookmark, index) => (
                      <Badge 
                        key={index} 
                        className="cursor-pointer" 
                        onClick={() => goToBookmark(bookmark.time)}
                        variant="outline"
                      >
                        {bookmark.label} ({formatDuration(bookmark.time)})
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Playlist (will be expanded in future) */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div 
              className="mt-4 p-3 bg-muted/30 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Próximos na fila</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver tudo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Esta funcionalidade estará disponível em breve. Você poderá criar filas de podcasts para ouvir em sequência.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
