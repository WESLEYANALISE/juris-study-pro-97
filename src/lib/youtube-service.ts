
// Types for YouTube data
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  duration: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  channelTitle: string;
}

// Interface for playlists from the database
export interface StoredPlaylist {
  id: string;
  playlist_id: string;
  playlist_title: string;
  thumbnail_url: string;
  channel_title: string;
  video_count: number;
  area: string;
  is_single_video?: boolean;
  video_id?: string;
  created_at?: string;
  updated_at?: string;
}

const YOUTUBE_API_KEY = 'AIzaSyC_vdQ6MShNiZo60KK2sHO-lgMhUda1woE';

// Function to get juridic playlists from YouTube
export async function getJuridicPlaylists(keyword: string): Promise<YouTubePlaylist[]> {
  console.log(`Searching for playlists with keyword: ${keyword}`);
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=direito ${keyword}&type=playlist&maxResults=10&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract playlist IDs
    const playlistIds = data.items.map((item: any) => item.id.playlistId);
    
    // Get detailed info for each playlist
    const playlistDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!playlistDetailsResponse.ok) {
      throw new Error(`YouTube API returned ${playlistDetailsResponse.status}`);
    }
    
    const playlistDetails = await playlistDetailsResponse.json();
    
    return playlistDetails.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      videoCount: item.contentDetails.itemCount,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

// Function to get videos from a playlist
export async function getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
  console.log(`Getting videos for playlist: ${playlistId}`);
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=25&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract video IDs for fetching additional details
    const videoIds = data.items.map((item: any) => item.contentDetails.videoId);
    
    // Get video details including duration
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!videoDetailsResponse.ok) {
      throw new Error(`YouTube API returned ${videoDetailsResponse.status}`);
    }
    
    const videoDetails = await videoDetailsResponse.json();
    
    // Format duration from ISO 8601 to readable format
    const formatDuration = (isoDuration: string) => {
      const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = match[1] ? match[1].replace('H', '') : '0';
      const minutes = match[2] ? match[2].replace('M', '') : '0';
      const seconds = match[3] ? match[3].replace('S', '') : '0';
      
      if (hours !== '0') {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.padStart(2, '0')}`;
    };
    
    return videoDetails.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      duration: formatDuration(item.contentDetails.duration)
    }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

// Function to get channel ID from username
export async function getChannelId(channelUsername: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${channelUsername}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting channel ID:", error);
    return null;
  }
}

// Function to get channel videos
export async function getChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
  try {
    // First get uploads playlist ID
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
      return getPlaylistVideos(uploadsPlaylistId);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting channel videos:", error);
    return [];
  }
}

// Function to get channel playlists
export async function getChannelPlaylists(channelId: string): Promise<YouTubePlaylist[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=25&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      videoCount: item.contentDetails.itemCount,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Error getting channel playlists:", error);
    return [];
  }
}

// Function to search videos
export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=direito ${query}&type=video&maxResults=25&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract video IDs
    const videoIds = data.items.map((item: any) => item.id.videoId);
    
    // Get video details including duration
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!videoDetailsResponse.ok) {
      throw new Error(`YouTube API returned ${videoDetailsResponse.status}`);
    }
    
    const videoDetails = await videoDetailsResponse.json();
    
    // Format duration from ISO 8601 to readable format
    const formatDuration = (isoDuration: string) => {
      const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = match[1] ? match[1].replace('H', '') : '0';
      const minutes = match[2] ? match[2].replace('M', '') : '0';
      const seconds = match[3] ? match[3].replace('S', '') : '0';
      
      if (hours !== '0') {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.padStart(2, '0')}`;
    };
    
    return videoDetails.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      duration: formatDuration(item.contentDetails.duration)
    }));
  } catch (error) {
    console.error("Error searching videos:", error);
    return [];
  }
}

// Function to get playlists from the database
export async function getStoredPlaylists(): Promise<StoredPlaylist[]> {
  try {
    const { data, error } = await supabase
      .from('video_playlists_juridicas')
      .select('*')
      .order('playlist_title');
    
    if (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
    
    // Cast the returned data to include the optional properties
    const typedPlaylists = (data || []).map((playlist: any) => ({
      ...playlist,
      is_single_video: Boolean(playlist.is_single_video || false),
      video_id: playlist.video_id || undefined
    })) as StoredPlaylist[];
    
    return typedPlaylists;
  } catch (error) {
    console.error('Exception fetching playlists:', error);
    return [];
  }
}

// Function to get video transcript
export async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // First check if we already have the transcript in our database
    const { data: existingTranscript, error: fetchError } = await supabase
      .from('video_transcripts')
      .select('transcript')
      .eq('video_id', videoId)
      .single();
    
    if (existingTranscript) {
      return existingTranscript.transcript;
    }
    
    // If not in database, fetch it using our edge function
    const { data, error } = await supabase.functions.invoke('fetch-video-transcript', {
      body: { videoId }
    });
    
    if (error) {
      throw error;
    }
    
    if (data?.transcript) {
      // Store the transcript in the database for future use
      await supabase
        .from('video_transcripts')
        .insert({
          video_id: videoId,
          transcript: data.transcript
        });
      
      return data.transcript;
    }
    
    return 'Transcrição não disponível para este vídeo.';
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    return 'Erro ao buscar a transcrição do vídeo.';
  }
}

// Function to generate questions for a video
export async function generateQuestionsForVideo(videoId: string, transcript?: string): Promise<any> {
  try {
    // If no transcript provided, fetch it
    const videoTranscript = transcript || await getVideoTranscript(videoId);
    
    const { data, error } = await supabase.functions.invoke('generate-video-questions', {
      body: { 
        videoId, 
        transcript: videoTranscript 
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

// Helper function to convert StoredPlaylist to YouTubePlaylist
export function storedPlaylistToYouTubePlaylist(storedPlaylist: StoredPlaylist): YouTubePlaylist {
  return {
    id: storedPlaylist.playlist_id,
    title: storedPlaylist.playlist_title,
    description: storedPlaylist.area,
    thumbnail: storedPlaylist.thumbnail_url,
    videoCount: storedPlaylist.video_count,
    channelTitle: storedPlaylist.channel_title
  };
}

// Import Supabase client
import { supabase } from '@/integrations/supabase/client';
