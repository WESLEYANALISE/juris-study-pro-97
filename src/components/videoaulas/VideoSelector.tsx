
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./VideoCard";
import { YouTubePlaylist, YouTubeVideo, getPlaylistVideos, getStoredPlaylists, storedPlaylistToYouTubePlaylist } from "@/lib/youtube-service";

interface VideoSelectorProps {
  onSelectVideo: (videoId: string) => void;
  searchTerm?: string;
}

export function VideoSelector({ onSelectVideo, searchTerm }: VideoSelectorProps) {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      loadVideos(selectedPlaylist);
    } else {
      setVideos([]);
    }
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const storedPlaylists = await getStoredPlaylists();
      const convertedPlaylists = storedPlaylists.map(storedPlaylistToYouTubePlaylist);
      setPlaylists(convertedPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (playlistId: string) => {
    setLoading(true);
    try {
      const videos = await getPlaylistVideos(playlistId);
      setVideos(videos);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    setSelectedVideo(null);
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId);
    onSelectVideo(videoId);
  };

  const filteredPlaylists = playlists.filter(playlist => {
    if (!searchTerm) return true;
    return playlist.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredVideos = videos.filter(video => {
    if (!searchTerm) return true;
    return video.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Playlists</h2>
        <div className="flex flex-wrap gap-2">
          {filteredPlaylists.map(playlist => (
            <Button
              key={playlist.id}
              variant={selectedPlaylist === playlist.id ? "default" : "outline"}
              onClick={() => handlePlaylistClick(playlist.id)}
              disabled={loading}
            >
              {playlist.title}
            </Button>
          ))}
        </div>
      </div>

      {selectedPlaylist && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Vídeos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                isSelected={selectedVideo === video.id}
                onClick={() => handleVideoClick(video.id)}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
