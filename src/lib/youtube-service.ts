
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

// Mock data for playlists
const MOCK_PLAYLISTS: YouTubePlaylist[] = [
  {
    id: 'PLgRnmS7DjCR5vUdKCF_-A2VdB9Dh_T9mi',
    title: 'Direito Constitucional - Teoria Geral',
    description: 'Aulas sobre fundamentos do Direito Constitucional',
    thumbnail: 'https://i.ytimg.com/vi/XXX/default.jpg',
    videoCount: 15,
    channelTitle: 'Curso Jurídico'
  },
  {
    id: 'PLgRnmS7DjCR5vUdKCF_-A2VdB9Dh_T9mj',
    title: 'Direito Civil - Contratos',
    description: 'Aulas sobre contratos no Direito Civil',
    thumbnail: 'https://i.ytimg.com/vi/YYY/default.jpg',
    videoCount: 12,
    channelTitle: 'Curso Jurídico'
  },
  {
    id: 'PLgRnmS7DjCR5vUdKCF_-A2VdB9Dh_T9mk',
    title: 'Direito Penal - Parte Geral',
    description: 'Aulas sobre parte geral do Direito Penal',
    thumbnail: 'https://i.ytimg.com/vi/ZZZ/default.jpg',
    videoCount: 18,
    channelTitle: 'Curso Jurídico'
  }
];

// Mock data for videos
const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'video1',
    title: 'Introdução ao Direito Constitucional',
    description: 'Nesta aula vamos aprender os conceitos básicos do Direito Constitucional.',
    thumbnail: 'https://i.ytimg.com/vi/111/default.jpg',
    publishedAt: '2023-01-15T14:00:00Z',
    channelTitle: 'Curso Jurídico',
    duration: '45:20'
  },
  {
    id: 'video2',
    title: 'Princípios Fundamentais da Constituição',
    description: 'Análise dos princípios fundamentais da Constituição Federal.',
    thumbnail: 'https://i.ytimg.com/vi/222/default.jpg',
    publishedAt: '2023-01-22T14:00:00Z',
    channelTitle: 'Curso Jurídico',
    duration: '42:15'
  },
  {
    id: 'video3',
    title: 'Direitos e Garantias Fundamentais',
    description: 'Estudo dos direitos e garantias fundamentais previstos na Constituição.',
    thumbnail: 'https://i.ytimg.com/vi/333/default.jpg',
    publishedAt: '2023-01-29T14:00:00Z',
    channelTitle: 'Curso Jurídico',
    duration: '50:10'
  }
];

// Mock function to get playlists
export async function getJuridicPlaylists(keyword: string): Promise<YouTubePlaylist[]> {
  console.log(`Searching for playlists with keyword: ${keyword}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_PLAYLISTS.filter(playlist => 
    playlist.title.toLowerCase().includes(keyword.toLowerCase()) ||
    playlist.description.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Mock function to get videos from a playlist
export async function getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
  console.log(`Getting videos for playlist: ${playlistId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_VIDEOS;
}

// Mock function to get channel ID from username
export async function getChannelId(channelUsername: string): Promise<string | null> {
  console.log(`Getting channel ID for username: ${channelUsername}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock channel ID
  return 'UC123456789ABCDEFGH';
}

// Mock function to get videos from a channel
export async function getChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
  console.log(`Getting videos from channel: ${channelId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_VIDEOS;
}

// Function to get playlists from the database
export async function getStoredPlaylists(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('video_playlists_juridicas')
      .select('*')
      .order('playlist_title');

    if (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching playlists:', error);
    return [];
  }
}

// Import Supabase client
import { supabase } from '@/integrations/supabase/client';
