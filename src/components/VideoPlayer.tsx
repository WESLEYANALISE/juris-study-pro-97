
import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onStateChange?: (event: YT.PlayerStateChangeEvent) => void;
  setPlayerRef?: (player: YT.Player) => void;
  autoPlay?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onTimeUpdate,
  onStateChange,
  setPlayerRef,
  autoPlay = true,
  width = '100%',
  height = '100%',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const timeUpdateInterval = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (timeUpdateInterval.current) {
        window.clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Handle videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId);
      setIsLoading(true);
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (!containerRef.current || !videoId || playerRef.current) return;

    try {
      const player = new window.YT.Player(containerRef.current, {
        videoId,
        width,
        height,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError
        }
      });

      playerRef.current = player;
      
      if (setPlayerRef) {
        setPlayerRef(player);
      }
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setError('Failed to load video player');
    }
  };

  const handlePlayerReady = () => {
    setIsLoading(false);
    
    // Set up time update interval if callback is provided
    if (onTimeUpdate && playerRef.current) {
      timeUpdateInterval.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            onTimeUpdate(currentTime);
          } catch (error) {
            console.error('Error getting current time:', error);
          }
        }
      }, 1000);
    }
  };

  const handleStateChange = (event: YT.PlayerStateChangeEvent) => {
    if (onStateChange) {
      onStateChange(event);
    }
    
    // If video ended, clear the interval
    if (event.data === window.YT.PlayerState.ENDED && timeUpdateInterval.current) {
      window.clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
    
    // If video is playing, make sure interval is running
    if (event.data === window.YT.PlayerState.PLAYING && onTimeUpdate && !timeUpdateInterval.current) {
      timeUpdateInterval.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            onTimeUpdate(currentTime);
          } catch (error) {
            console.error('Error getting current time:', error);
          }
        }
      }, 1000);
    }
  };

  const handleError = (event: YT.OnErrorEvent) => {
    console.error('YouTube player error:', event);
    setError('Error loading video. Please try again later.');
    setIsLoading(false);
  };

  return (
    <div className={`video-player-container ${className}`} style={{ width, height, position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={initializePlayer} 
              className="px-4 py-2 bg-primary rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
