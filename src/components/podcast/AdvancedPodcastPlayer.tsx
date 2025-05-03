
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  VolumeX, Download, Share, MessageSquare, 
  Heart, List, Settings, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import './AdvancedPodcastPlayer.css';
import { formatTime } from '@/lib/format';

interface AdvancedPodcastPlayerProps {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  imageUrl?: string; // Changed from coverImage
  author?: string;
  duration?: number;
  publishedAt?: string | Date;
  categories?: Array<{name: string, slug: string}>;
  onClose?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onPlaybackComplete?: () => void;
  onPlaybackProgress?: (progress: number) => void;
  onError?: (error: any) => void;
  mini?: boolean;
}

export const AdvancedPodcastPlayer = ({
  id,
  title,
  description,
  audioUrl,
  imageUrl, // Changed from coverImage
  author,
  duration = 0,
  publishedAt,
  categories,
  onClose,
  onPlaybackChange,
  onPlaybackComplete,
  onPlaybackProgress,
  onError,
  mini = false
}: AdvancedPodcastPlayerProps) => {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  const [hasPeaks, setHasPeaks] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.preload = "metadata";
      audio.volume = volume;
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('canplay', () => setIsBuffering(false));
      audio.addEventListener('progress', handleProgress);
      
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('waiting', () => setIsBuffering(true));
        audioRef.current.removeEventListener('canplay', () => setIsBuffering(false));
        audioRef.current.removeEventListener('progress', handleProgress);
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioUrl]);
  
  // Handle changes to volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
  // Event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      onPlaybackProgress?.(audioRef.current.currentTime / audioRef.current.duration);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    onPlaybackComplete?.();
    toast({
      description: "Podcast concluído",
    });
  };
  
  const handleAudioError = (error: any) => {
    console.error("Audio playback error:", error);
    setIsPlaying(false);
    onError?.(error);
    toast({
      description: "Erro na reprodução do áudio",
      variant: "destructive"
    });
  };
  
  const handleProgress = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        setLoadedPercentage((bufferedEnd / duration) * 100);
      }
    }
  };
  
  // Player controls
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(error => {
        console.error("Play error:", error);
        toast({
          description: "Não foi possível reproduzir o áudio",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
    onPlaybackChange?.(!isPlaying);
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        audioDuration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    setIsSettingsOpen(false);
    toast({
      description: `Velocidade: ${rate}x`,
    });
  };
  
  // Render player UI
  return (
    <div
      className={cn(
        "podcast-player-container bg-background rounded-lg border shadow-md overflow-hidden transition-all",
        mini ? "max-h-24" : "p-4",
        isExpanded ? "expanded" : ""
      )}
    >
      <div className={cn("flex", mini ? "h-24 items-center px-4" : "flex-col md:flex-row")}>
        {/* Cover Image */}
        {imageUrl && (
          <div className={cn(
            "podcast-cover-container relative overflow-hidden rounded-lg",
            mini ? "w-16 h-16 mr-4 flex-shrink-0" : "md:w-48 md:h-48 w-full h-48 mb-4 md:mb-0 md:mr-6"
          )}>
            <img 
              src={imageUrl} 
              alt={`Cover for ${title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/podcast-placeholder.jpg';
              }}
            />
            
            {isPlaying && !mini && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="visualization-container w-12 h-12 flex items-center justify-center">
                  <div className="visualization-spinner"></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main Player Content */}
        <div className={cn("flex-1", mini ? "" : "")}>
          {/* Title and Controls - Mini Mode */}
          {mini && (
            <div className="flex flex-col mr-4 overflow-hidden">
              <span className="font-medium text-sm truncate">{title}</span>
              {author && (
                <span className="text-xs text-muted-foreground truncate">{author}</span>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={togglePlayPause}
                  disabled={isLoading}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Progress 
                  value={(currentTime / audioDuration) * 100 || 0} 
                  className="h-1.5 w-32"
                />
              </div>
            </div>
          )}
          
          {/* Title and Info - Full Mode */}
          {!mini && (
            <div className="mb-4">
              <h3 className="text-lg font-medium line-clamp-1">{title}</h3>
              {author && (
                <p className="text-sm text-muted-foreground">{author}</p>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>
              )}
            </div>
          )}
          
          {/* Full Player Controls */}
          {!mini && (
            <div className="player-controls space-y-4">
              {/* Progress bar and timestamps */}
              <div className="flex items-center space-x-2">
                <div className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </div>
                <div className="relative flex-1 h-4 flex items-center">
                  {/* Buffering indicator */}
                  <div 
                    className="absolute h-1.5 bg-muted-foreground/20 rounded-full" 
                    style={{ width: `${loadedPercentage}%` }}
                  />
                  
                  {/* Waveform if available */}
                  {hasPeaks ? (
                    <canvas 
                      ref={waveformRef} 
                      className="waveform-canvas absolute" 
                    />
                  ) : null}
                  
                  {/* Progress slider */}
                  <Slider
                    value={[currentTime]}
                    max={audioDuration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="z-10"
                  />
                </div>
                <div className="text-xs text-muted-foreground w-10">
                  {formatTime(audioDuration)}
                </div>
              </div>
              
              {/* Main controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {/* Skip back */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 player-control-secondary" 
                    onClick={() => skip(-10)}
                    aria-label="Retroceder 10 segundos"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  {/* Play/Pause */}
                  <Button 
                    variant="default" 
                    size="icon" 
                    className={cn(
                      "h-10 w-10 rounded-full player-control-primary",
                      isPlaying ? "play-button-active" : ""
                    )}
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isBuffering ? (
                      <span className="loading-spinner"></span>
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  {/* Skip forward */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 player-control-secondary" 
                    onClick={() => skip(30)}
                    aria-label="Avançar 30 segundos"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Volume control */}
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      aria-label={isMuted ? "Ativar som" : "Desativar som"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div 
                      className={cn(
                        "volume-slider-container transition-all flex items-center",
                        showVolumeSlider ? "volume-slider-visible" : "volume-slider-hidden"
                      )}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-[80px]"
                      />
                    </div>
                  </div>
                  
                  {/* Playback speed */}
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8 player-control-secondary"
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      aria-label="Configurações de velocidade"
                    >
                      {playbackRate}x
                    </Button>
                    
                    {isSettingsOpen && (
                      <div className="absolute right-0 bottom-full mb-2 bg-popover border rounded-md shadow-md p-2 z-10 speed-dropdown">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            className={cn(
                              "block w-full text-left px-2 py-1 text-sm rounded hover:bg-accent",
                              playbackRate === rate ? "bg-accent/50" : ""
                            )}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Additional controls */}
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 player-control-secondary"
                      aria-label="Baixar podcast"
                      onClick={() => {
                        toast({
                          description: "Iniciando download...",
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 player-control-secondary"
                      aria-label="Favoritar podcast"
                      onClick={() => {
                        toast({
                          description: "Podcast adicionado aos favoritos",
                        });
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
