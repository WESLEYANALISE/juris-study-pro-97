
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookmarkPlus, MessageSquare } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onStateChange?: (event: YT.PlayerStateChangeEvent) => void;
  setPlayerRef?: (player: YT.Player) => void;
}

export function VideoPlayer({ videoId, onTimeUpdate, onStateChange, setPlayerRef }: VideoPlayerProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const timeTrackingRef = useRef<number | null>(null);

  // Calcular a altura do player com base na largura (proporção 16:9)
  const calculatePlayerHeight = () => {
    const containerWidth = document.querySelector(".video-container")?.clientWidth || 640;
    return (containerWidth * 9) / 16;
  };

  const [playerHeight, setPlayerHeight] = useState(calculatePlayerHeight());

  // Initialize YouTube player
  useEffect(() => {
    // Load YouTube iframe API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (playerRef.current && videoId) {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          events: {
            onReady: () => {
              console.log('Player ready');
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
              }
              
              if (onStateChange) {
                onStateChange(event);
              }
            },
          },
        });
      }
    };

    // Wait for the YouTube API to load before initializing the player
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
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
  }, [videoId, setPlayerRef]);

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
      <div className="video-container w-full">
        <div ref={playerRef} style={{ width: '100%', height: playerHeight }} />
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
