
import React, { useEffect, useRef } from 'react';

interface FixedVideoPlayerProps {
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
}: FixedVideoPlayerProps) => {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the YouTube IFrame Player API script if it's not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      if (containerRef.current && window.YT) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
          },
          events: {
            onReady: () => onReady && onReady(),
            onError: (e) => onError && onError(e)
          }
        });
      }
    };

    // Either initialize immediately if YT is loaded, or wait for API to load
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      // Define or update the callback
      const oldCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (oldCallback) oldCallback();
        initializePlayer();
      };
    }

    // Cleanup function to destroy player
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, onReady, onError]);

  // Update video when videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  return (
    <div className="aspect-video w-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
