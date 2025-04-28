
// YouTube Data API v3 service

// API Key - using the new key provided
const API_KEY = "AIzaSyDlM4OBBfKmZDMSitzbSX8OCBOgqkGCQVc";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

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

// Função para buscar playlists por termo de busca
export async function searchPlaylists(
  query: string,
  maxResults: number = 10
): Promise<YouTubePlaylist[]> {
  try {
    // Added regionCode and relevanceLanguage for better Brazilian Portuguese results
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
        query + " direito"
      )}&type=playlist&maxResults=${maxResults}&regionCode=BR&relevanceLanguage=pt&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar playlists");
    }

    const data = await response.json();
    
    // Extrair IDs das playlists para buscar detalhes
    const playlistIds = data.items.map((item: any) => item.id.playlistId).join(",");
    
    if (!playlistIds) {
      return [];
    }
    
    // Buscar detalhes das playlists
    const detailsResponse = await fetch(
      `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistIds}&key=${API_KEY}`
    );
    
    if (!detailsResponse.ok) {
      throw new Error("Erro ao buscar detalhes das playlists");
    }
    
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.items || detailsData.items.length === 0) {
      return [];
    }
    
    return detailsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || 
                item.snippet.thumbnails.medium?.url || 
                item.snippet.thumbnails.default?.url,
      videoCount: item.contentDetails.itemCount,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("Erro ao buscar playlists:", error);
    return [];
  }
}

// Função para buscar playlists específicas de Direito
export async function getJuridicPlaylists(
  disciplina: string,
  maxResults: number = 10
): Promise<YouTubePlaylist[]> {
  return searchPlaylists(`${disciplina} direito aulas`, maxResults);
}

// Função para buscar vídeos de uma playlist
export async function getPlaylistVideos(
  playlistId: string,
  maxResults: number = 20  // Increased max results
): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar vídeos da playlist");
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Extrair IDs dos vídeos para buscar duração
    const videoIds = data.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .filter(Boolean) // Filter out any null/undefined values
      .join(",");
    
    if (!videoIds) {
      return [];
    }
    
    // Buscar detalhes dos vídeos (incluindo duração)
    const videosResponse = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
    );
    
    if (!videosResponse.ok) {
      throw new Error("Erro ao buscar detalhes dos vídeos");
    }
    
    const videosData = await videosResponse.json();
    
    // Processar duração ISO 8601 para formato legível
    const processDuration = (duration: string) => {
      // Converte formato PT1H23M45S para 1:23:45
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return "00:00";
      
      const hours = match[1] ? match[1] + ":" : "";
      const minutes = match[2] ? (hours && match[2].padStart(2, "0") || match[2]) + ":" : "00:";
      const seconds = match[3] ? match[3].padStart(2, "0") : "00";
      
      return hours + minutes + seconds;
    };

    // Mesclar dados dos vídeos com suas durações
    return data.items.map((item: any) => {
      const videoDetails = videosData.items && videosData.items.find(
        (v: any) => v.id === item.snippet.resourceId.videoId
      );
      
      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || 
                  item.snippet.thumbnails.medium?.url || 
                  item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        duration: videoDetails ? processDuration(videoDetails.contentDetails.duration) : "00:00",
      };
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos da playlist:", error);
    return [];
  }
}

// Função para buscar playlists do banco de dados supabase
export async function getStoredPlaylists(area?: string) {
  try {
    const { supabase } = await import("@/lib/supabaseClient");
    
    let query = supabase
      .from("video_playlists_juridicas")
      .select("*")
      .order("video_count", { ascending: false });
      
    if (area) {
      query = query.eq("area", area);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      id: item.playlist_id,
      title: item.playlist_title,
      description: "",
      thumbnail: item.thumbnail_url,
      videoCount: item.video_count,
      channelTitle: item.channel_title,
      area: item.area
    }));
  } catch (error) {
    console.error("Erro ao buscar playlists armazenadas:", error);
    return [];
  }
}
