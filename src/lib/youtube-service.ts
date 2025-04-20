
// YouTube Data API v3 service

// API Key fornecida (em produção, isso deveria estar em variáveis de ambiente)
const API_KEY = "AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8";
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
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
        query + " direito"
      )}&type=playlist&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar playlists");
    }

    const data = await response.json();
    
    // Extrair IDs das playlists para buscar detalhes
    const playlistIds = data.items.map((item: any) => item.id.playlistId).join(",");
    
    // Buscar detalhes das playlists
    const detailsResponse = await fetch(
      `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistIds}&key=${API_KEY}`
    );
    
    if (!detailsResponse.ok) {
      throw new Error("Erro ao buscar detalhes das playlists");
    }
    
    const detailsData = await detailsResponse.json();
    
    return detailsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
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
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar vídeos da playlist");
    }

    const data = await response.json();
    
    // Extrair IDs dos vídeos para buscar duração
    const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(",");
    
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
    return data.items.map((item: any, index: number) => {
      const videoDetails = videosData.items.find(
        (v: any) => v.id === item.snippet.resourceId.videoId
      );
      
      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
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
