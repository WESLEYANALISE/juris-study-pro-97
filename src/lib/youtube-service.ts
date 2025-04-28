import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  channelTitle: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  subscriberCount: number;
}

export const getChannelId = async (channelName: string): Promise<string | null> => {
  try {
    const response = await youtube.search.list({
      part: ['id'],
      q: channelName,
      type: ['channel'],
      maxResults: 1,
    });

    const channelId = response.data.items?.[0]?.id?.channelId;
    return channelId || null;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    return null;
  }
};

export const getChannelDetails = async (channelId: string): Promise<Channel | null> => {
  try {
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [channelId],
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      return null;
    }

    return {
      id: channel.id!,
      title: channel.snippet!.title!,
      description: channel.snippet!.description!,
      thumbnail: channel.snippet!.thumbnails!.high!.url!,
      videoCount: Number(channel.statistics!.videoCount!),
      subscriberCount: Number(channel.statistics!.subscriberCount!),
    };
  } catch (error) {
    console.error('Error getting channel details:', error);
    return null;
  }
};

export const getChannelPlaylists = async (channelId: string): Promise<Playlist[]> => {
  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      channelId: channelId,
      maxResults: 50,
    });

    if (!response.data.items) {
      return [];
    }

    const playlists: Playlist[] = response.data.items.map((item: any) => ({
      id: item.id!,
      title: item.snippet!.title!,
      description: item.snippet!.description!,
      thumbnail: item.snippet!.thumbnails!.high!.url!,
      videoCount: item.contentDetails!.itemCount!,
      channelTitle: item.snippet!.channelTitle!,
    }));

    return playlists;
  } catch (error) {
    console.error('Error getting channel playlists:', error);
    return [];
  }
};

export const getPlaylistDetails = async (playlistId: string): Promise<Playlist | null> => {
  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      id: [playlistId],
    });

    const playlist = response.data.items?.[0];

    if (!playlist) {
      return null;
    }

    return {
      id: playlist.id!,
      title: playlist.snippet!.title!,
      description: playlist.snippet!.description!,
      thumbnail: playlist.snippet!.thumbnails!.high!.url!,
      videoCount: playlist.contentDetails!.itemCount!,
      channelTitle: playlist.snippet!.channelTitle!,
    };
  } catch (error) {
    console.error('Error getting playlist details:', error);
    return null;
  }
};

export const getPlaylistVideos = async (playlistId: string): Promise<Video[]> => {
  try {
    const response = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: playlistId,
      maxResults: 50,
    });

    if (!response.data.items) {
      return [];
    }

    const videos: Video[] = response.data.items.map((item: any) => ({
      id: item.contentDetails!.videoId!,
      title: item.snippet!.title!,
      description: item.snippet!.description!,
      thumbnail: item.snippet!.thumbnails!.high!.url!,
      channelTitle: item.snippet!.channelTitle!,
      publishedAt: item.snippet!.publishedAt!,
    }));

    return videos;
  } catch (error) {
    console.error('Error getting playlist videos:', error);
    return [];
  }
};

export const getVideoDetails = async (videoId: string): Promise<{ title: string; description: string; thumbnail: string; channelTitle: string; } | null> => {
  try {
    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });
    
    const video = response.data.items?.[0];
    
    if (!video) {
      return null;
    }
    
    return {
      title: video.snippet!.title!,
      description: video.snippet!.description!,
      thumbnail: video.snippet!.thumbnails!.high!.url!,
      channelTitle: video.snippet!.channelTitle!,
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    return null;
  }
};

export const getChannelVideos = async (channelId: string): Promise<Video[]> => {
    try {
        // First, fetch the uploads playlist ID for the channel
        const channelResponse = await youtube.channels.list({
            part: ['contentDetails'],
            id: [channelId],
        });

        const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
            console.error('No uploads playlist found for channel:', channelId);
            return [];
        }

        // Then, fetch the videos from the uploads playlist
        const playlistItemsResponse = await youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: uploadsPlaylistId,
            maxResults: 50, // Adjust as needed
        });

        if (!playlistItemsResponse.data.items) {
            console.warn('No videos found in uploads playlist for channel:', channelId);
            return [];
        }

        const videos: Video[] = playlistItemsResponse.data.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
        }));

        return videos;

    } catch (error) {
        console.error('Error getting channel videos:', error);
        return [];
    }
};

export const syncPlaylistToDatabase = async (playlistId: string, area: string, isVideoSingle = false, videoId = '') => {
  try {
    if (isVideoSingle && videoId) {
      // Handle single video case
      const videoDetails = await getVideoDetails(videoId);
      
      if (!videoDetails) {
        throw new Error('No video details found');
      }
      
      const { data, error } = await supabase
        .from('video_playlists_juridicas')
        .insert({
          playlist_id: videoId, // Using video ID as playlist ID for singles
          playlist_title: videoDetails.title,
          thumbnail_url: videoDetails.thumbnail,
          channel_title: videoDetails.channelTitle,
          video_count: 1,
          area: area,
          is_single_video: true,
          video_id: videoId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } else {
      // Handle playlist case
      const playlist = await getPlaylistDetails(playlistId);
      
      if (!playlist) {
        throw new Error('No playlist found');
      }
      
      const { data, error } = await supabase
        .from('video_playlists_juridicas')
        .insert({
          playlist_id: playlistId,
          playlist_title: playlist.title,
          thumbnail_url: playlist.thumbnail,
          channel_title: playlist.channelTitle,
          video_count: playlist.videoCount,
          area: area
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    }
  } catch (error: any) {
    console.error('Error syncing playlist to database:', error);
    return { success: false, error: error.message };
  }
};

// Import supabase from the correct location
import { supabase } from '@/integrations/supabase/client';
