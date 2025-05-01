
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export const FixedVideoPlayer = ({ 
  videoId, 
  autoplay = false, 
  onReady,
  onError
}: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);
  
  // Load YouTube API
  useEffect(() => {
    // Only load the script once
    if (!document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Insert the script before the first script tag
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    let timeoutId: number;
    
    // Initialize YouTube player once API is loaded
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          if (playerRef.current) {
            playerRef.current.destroy();
          }
          
          playerRef.current = new window.YT.Player(playerIdRef.current, {
            videoId,
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                console.log('YouTube player ready');
                setIsLoading(false);
                if (onReady) onReady();
              },
              onError: (event: any) => {
                console.error('YouTube player error:', event);
                setError(`Erro ao carregar o vídeo: ${event.data}`);
                setIsLoading(false);
                if (onError) onError(event);
              },
              onStateChange: (event: any) => {
                // Track video state changes if needed
                console.log('Player state changed:', event.data);
              }
            }
          });
        } catch (err) {
          console.error('Error creating YouTube player:', err);
          setError('Erro ao inicializar o player de vídeo');
          setIsLoading(false);
        }
      } else {
        // If YT is not available yet, try again in 500ms
        timeoutId = window.setTimeout(initPlayer, 500);
      }
    };
    
    // Define the callback for when YouTube API is ready
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      // API already loaded, initialize player directly
      initPlayer();
    } else {
      // Wait a bit for API to load
      timeoutId = window.setTimeout(initPlayer, 1000);
    }
    
    return () => {
      window.clearTimeout(timeoutId);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, [videoId, autoplay, onReady]);

  // Handle player API errors
  useEffect(() => {
    const handleAPIFailure = () => {
      console.error('YouTube API failed to load');
      setError('Falha ao carregar a API do YouTube');
      setIsLoading(false);
    };

    // Set a timeout to detect if API fails to load
    const timeoutId = window.setTimeout(handleAPIFailure, 10000);
    
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-4 text-center">
            <p className="text-destructive font-medium mb-2">Erro ao carregar o vídeo</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        )}
        
        <div ref={containerRef} className="w-full h-full">
          <div id={playerIdRef.current}></div>
        </div>
      </CardContent>
    </Card>
  );
};
