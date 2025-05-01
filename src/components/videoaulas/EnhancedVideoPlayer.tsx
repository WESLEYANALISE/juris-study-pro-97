
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";

interface EnhancedVideoPlayerProps {
  videoId: string;
  title?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const EnhancedVideoPlayer = ({
  videoId,
  title,
  onError,
  onLoad
}: EnhancedVideoPlayerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Load the YouTube IFrame API
  useEffect(() => {
    // If already loaded, don't load again
    if (window.YT) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API Ready');
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Initialize the player
  useEffect(() => {
    if (!window.YT || !playerRef.current || !videoId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            console.log('Player ready');
            setPlayer(event.target);
            setDuration(event.target.getDuration());
            setLoading(false);
            if (onLoad) onLoad();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            const errorMessage = getYouTubeErrorMessage(event.data);
            setError(errorMessage);
            setLoading(false);
            
            if (loadAttempts < 3) {
              console.log(`Retrying load (attempt ${loadAttempts + 1})`);
              setLoadAttempts(prev => prev + 1);
              
              if (playerRef.current) {
                // Clear the container and recreate the div
                playerRef.current.innerHTML = '';
                const newPlayerDiv = document.createElement('div');
                newPlayerDiv.id = 'youtube-player';
                playerRef.current.appendChild(newPlayerDiv);
                
                // Give a moment to clean up before reloading
                setTimeout(() => {
                  initPlayer();
                }, 1000);
              }
            } else {
              if (onError) onError(new Error(errorMessage));
              toast({
                title: "Erro ao carregar vídeo",
                description: errorMessage,
                variant: "destructive"
              });
            }
          }
        }
      });

      // Update current time every second
      const interval = setInterval(() => {
        if (newPlayer && newPlayer.getCurrentTime) {
          setCurrentTime(newPlayer.getCurrentTime());
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        if (newPlayer && newPlayer.destroy) {
          newPlayer.destroy();
        }
      };
    } catch (error) {
      console.error("Error initializing YouTube player:", error);
      setError("Failed to initialize video player");
      setLoading(false);
      if (onError) onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }, [videoId, loadAttempts, onError, onLoad, toast]);

  const initPlayer = () => {
    if (!window.YT || !playerRef.current || !videoId) {
      setTimeout(initPlayer, 100);
      return;
    }
    
    // Force re-create player
    if (playerRef.current) {
      playerRef.current.innerHTML = '';
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            console.log('Player ready');
            setPlayer(event.target);
            setDuration(event.target.getDuration());
            setLoading(false);
            if (onLoad) onLoad();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            const errorMessage = getYouTubeErrorMessage(event.data);
            setError(errorMessage);
            setLoading(false);
            if (onError) onError(new Error(errorMessage));
          }
        }
      });
      
      setPlayer(newPlayer);
    } catch (error) {
      console.error("Error initializing YouTube player:", error);
      setError("Failed to initialize video player");
      setLoading(false);
      if (onError) onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  const getYouTubeErrorMessage = (errorCode: number): string => {
    switch(errorCode) {
      case 2:
        return "Parâmetro inválido. Por favor tente outro vídeo.";
      case 5:
        return "Erro no reprodutor HTML5. Tente novamente mais tarde.";
      case 100:
        return "Vídeo não encontrado ou indisponível.";
      case 101:
      case 150:
        return "O proprietário do vídeo não permite sua reprodução em outros sites.";
      default:
        return "Ocorreu um erro ao carregar o vídeo. Tente novamente mais tarde.";
    }
  };

  const handlePlayPause = () => {
    if (!player) return;
    
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    
    setPlaying(!playing);
  };

  const handleMuteToggle = () => {
    if (!player) return;
    
    if (muted) {
      player.unMute();
    } else {
      player.mute();
    }
    
    setMuted(!muted);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    
    const seekTime = parseInt(event.target.value);
    player.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const handleSkipForward = () => {
    if (!player) return;
    player.seekTo(Math.min(currentTime + 15, duration), true);
  };

  const handleSkipBackward = () => {
    if (!player) return;
    player.seekTo(Math.max(currentTime - 15, 0), true);
  };

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    try {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  };

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[300px] text-center">
          <div className="text-destructive mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Erro ao carregar o vídeo</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => setLoadAttempts(prev => prev + 1)}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={playerContainerRef}
        className="relative aspect-video bg-black overflow-hidden rounded-md"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        )}
        
        <div 
          ref={playerRef} 
          className="w-full h-full"
          id="youtube-player"
        />
        
        {player && !loading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex flex-col opacity-0 hover:opacity-100 transition-opacity">
            <input 
              type="range"
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-500/50 rounded-full overflow-hidden appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0"
            />
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/10 hover:text-white" 
                  onClick={handleSkipBackward}
                >
                  <SkipBack size={18} />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/10 hover:text-white" 
                  onClick={handlePlayPause}
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/10 hover:text-white" 
                  onClick={handleSkipForward}
                >
                  <SkipForward size={18} />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/10 hover:text-white" 
                  onClick={handleMuteToggle}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/10 hover:text-white" 
                  onClick={handleFullscreen}
                >
                  <Maximize size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {title && <p className="text-sm font-medium mt-2">{title}</p>}
    </div>
  );
};

export default EnhancedVideoPlayer;
