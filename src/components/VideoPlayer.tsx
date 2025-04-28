
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookmarkPlus, MessageSquare, RefreshCcw, AlertTriangle } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onStateChange?: (event: YT.PlayerStateChangeEvent) => void;
  setPlayerRef?: (player: YT.Player) => void;
}

export function VideoPlayer({ videoId, onTimeUpdate, onStateChange, setPlayerRef }: VideoPlayerProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const timeTrackingRef = useRef<number | null>(null);

  // Calcular a altura do player com base na largura (proporção 16:9)
  const calculatePlayerHeight = () => {
    const containerWidth = document.querySelector(".video-container")?.clientWidth || 640;
    return (containerWidth * 9) / 16;
  };

  const [playerHeight, setPlayerHeight] = useState(calculatePlayerHeight());

  // Function to initialize or reinitialize the player
  const initializePlayer = () => {
    setIsLoading(true);
    setHasError(false);
    
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Set a timeout to catch if YouTube API fails to load
      setTimeout(() => {
        if (!window.YT) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 5000);
      return;
    }

    // Clean up any existing player
    if (player) {
      player.destroy();
    }

    if (playerRef.current && videoId) {
      try {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: {
            rel: 0, // Don't show related videos
            modestbranding: 1 // Hide YouTube logo
          },
          events: {
            onReady: () => {
              console.log('Player ready');
              setIsLoading(false);
              setPlayer(ytPlayer);
              if (setPlayerRef) {
                setPlayerRef(ytPlayer);
              }
            },
            onStateChange: (event) => {
              // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
              if (event.data === 1) { // Playing
                // Start tracking time
                startTimeTracking(ytPlayer);
              } else if (event.data === 2 || event.data === 0) { // Paused or Ended
                // Stop tracking time
                if (timeTrackingRef.current) {
                  clearInterval(timeTrackingRef.current);
                  timeTrackingRef.current = null;
                }
              } else if (event.data === -1 || event.data === 3) {
                // Unstarted or buffering - potential issues
                console.log(`Player state: ${event.data}`);
              }
              
              if (onStateChange) {
                onStateChange(event);
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event);
              setHasError(true);
              setIsLoading(false);
            }
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  };

  // Initialize YouTube player
  useEffect(() => {
    // Wait for the YouTube API to load before initializing the player
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      // Clean up
      if (player) {
        player.destroy();
      }
      
      if (timeTrackingRef.current) {
        clearInterval(timeTrackingRef.current);
        timeTrackingRef.current = null;
      }
    };
  }, [videoId]);

  // Track video time and notify parent component
  const startTimeTracking = (ytPlayer: YT.Player) => {
    if (timeTrackingRef.current) {
      clearInterval(timeTrackingRef.current);
    }
    
    timeTrackingRef.current = window.setInterval(() => {
      if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        try {
          const currentTime = ytPlayer.getCurrentTime();
          if (onTimeUpdate) {
            onTimeUpdate(currentTime);
          }
        } catch (error) {
          console.error("Error getting current time:", error);
          if (timeTrackingRef.current) {
            clearInterval(timeTrackingRef.current);
            timeTrackingRef.current = null;
          }
        }
      }
    }, 1000); // Update every second

    return () => {
      if (timeTrackingRef.current) {
        clearInterval(timeTrackingRef.current);
        timeTrackingRef.current = null;
      }
    };
  };

  // Atualizar a altura do player quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      setPlayerHeight(calculatePlayerHeight());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full">
      <div className="video-container w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center" style={{ height: playerHeight }}>
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
              <span className="text-sm text-muted-foreground">Carregando vídeo...</span>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center" style={{ height: playerHeight }}>
            <div className="flex flex-col items-center text-center p-4">
              <AlertTriangle className="h-12 w-12 text-orange-500 mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Erro ao carregar o vídeo. Verifique sua conexão ou tente novamente.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={initializePlayer}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
        
        <div 
          ref={playerRef} 
          style={{ width: '100%', height: playerHeight }}
          className={hasError ? "invisible h-0" : ""}
        />
      </div>
      
      {showNotes && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-3">Minhas anotações</h3>
            <Textarea
              className="min-h-[150px] bg-background"
              placeholder="Digite suas anotações sobre este vídeo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setNotes("")}>
                Limpar
              </Button>
              <Button size="sm">
                Salvar anotações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {showNotes ? "Ocultar notas" : "Mostrar notas"}
        </Button>
      </div>
    </div>
  );
}
