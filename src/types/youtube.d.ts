
// Type definitions for YouTube IFrame Player API
interface YT {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId?: string;
      width?: number | string;
      height?: number | string;
      playerVars?: {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        enablejsapi?: 0 | 1;
        loop?: 0 | 1;
        modestbranding?: 0 | 1;
        origin?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        showinfo?: 0 | 1;
        start?: number;
        end?: number;
        [key: string]: any;
      };
      events?: {
        onReady?: (event: { target: YT.Player }) => void;
        onStateChange?: (event: { data: number; target: YT.Player }) => void;
        onPlaybackQualityChange?: (event: { target: YT.Player; data: string }) => void;
        onPlaybackRateChange?: (event: { target: YT.Player; data: number }) => void;
        onError?: (event: { target: YT.Player; data: number }) => void;
        onApiChange?: (event: { target: YT.Player }) => void;
      };
    }
  ) => YT.Player;
  
  // Add PlayerState enum
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

namespace YT {
  interface Player {
    // Methods
    loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    clearVideo(): void;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoLoadedFraction(): number;
    getVideoStartBytes(): number;
    getVideoBytesLoaded(): number;
    getVideoBytesTotal(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getPlaybackRate(): number;
    setPlaybackRate(suggestedRate: number): void;
    getAvailablePlaybackRates(): number[];
    getPlaybackQuality(): string;
    setPlaybackQuality(suggestedQuality: string): void;
    getAvailableQualityLevels(): string[];
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    destroy(): void;
  }
  
  // Define PlayerStateChangeEvent interface
  interface PlayerStateChangeEvent {
    data: number;
    target: YT.Player;
  }
}

// Define YouTubeVideo interface
interface YouTubeVideo {
  id: string;
  // videoId is required for use with YouTube Player API - removed this as it's causing confusion
  title: string;
  description: string;
  thumbnail: string;
  publishedAt?: string;
  channelId?: string;
  channelTitle?: string;
  duration?: string;
}

// Add YouTubePlaylist interface to match what's used in the codebase
interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  channelTitle: string;
  videoCount: number;
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: () => void;
}
