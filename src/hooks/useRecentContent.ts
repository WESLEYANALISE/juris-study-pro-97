
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico } from '@/types/biblioteca-juridica';

export interface RecentContent {
  id: string;
  title: string;
  type: 'book' | 'video' | 'podcast' | 'article';
  thumbnail_url?: string | null;
  path: string;
  last_accessed: Date;
  progress?: number;
}

export function useRecentContent(limit: number = 6) {
  const [content, setContent] = useState<RecentContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchRecentContent() {
      if (!user) {
        setContent([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get recent book views
        const { data: bookHistory, error: bookError } = await supabase
          .from('livros_historico_visualizacao')
          .select('livro_id, timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (bookError) throw bookError;

        // Get book details
        let recentBooks: RecentContent[] = [];
        if (bookHistory && bookHistory.length > 0) {
          const bookIds = bookHistory.map(history => history.livro_id);
          
          const { data: books } = await supabase
            .from('biblioteca_juridica10')
            .select('id, titulo, capa_url')
            .in('id', bookIds);

          // Get reading progress
          const { data: progress } = await supabase
            .from('biblioteca_leitura_progresso')
            .select('livro_id, pagina_atual')
            .eq('user_id', user.id)
            .in('livro_id', bookIds);

          if (books) {
            recentBooks = books.map(book => {
              const historyItem = bookHistory.find(h => h.livro_id === book.id);
              const progressItem = progress?.find(p => p.livro_id === book.id);
              
              // Default total pages if not available
              const totalPages = 100;
              
              return {
                id: book.id,
                title: book.titulo,
                type: 'book' as const,
                thumbnail_url: book.capa_url,
                path: `/biblioteca/view/${book.id}`,
                last_accessed: historyItem ? new Date(historyItem.timestamp) : new Date(),
                progress: progressItem?.pagina_atual ? 
                  (progressItem.pagina_atual / totalPages) * 100 : undefined
              };
            });
          }
        }

        // Get recent video progress
        const { data: videoProgress, error: videoError } = await supabase
          .from('user_video_progress')
          .select('video_id, last_watched_at')
          .eq('user_id', user.id)
          .order('last_watched_at', { ascending: false })
          .limit(limit);

        if (videoError) throw videoError;

        // Get video details - assuming there's a videos table
        let recentVideos: RecentContent[] = [];
        if (videoProgress && videoProgress.length > 0) {
          const videoIds = videoProgress.map(progress => progress.video_id);
          
          const { data: videos } = await supabase
            .from('video_aulas')
            .select('id, title, thumbnail_url')
            .in('id', videoIds);

          if (videos) {
            recentVideos = videos.map(video => {
              const progressItem = videoProgress.find(p => p.video_id === video.id);
              
              return {
                id: video.id,
                title: video.title,
                type: 'video' as const,
                thumbnail_url: video.thumbnail_url,
                path: `/videoaulas/${video.id}`,
                last_accessed: progressItem ? new Date(progressItem.last_watched_at) : new Date()
              };
            });
          }
        }

        // Get recent podcast progress
        const { data: podcastProgress, error: podcastError } = await supabase
          .from('user_podcast_progress')
          .select('podcast_id, last_played_at, progress_seconds')
          .eq('user_id', user.id)
          .order('last_played_at', { ascending: false })
          .limit(limit);

        if (podcastError) throw podcastError;

        // Get podcast details
        let recentPodcasts: RecentContent[] = [];
        if (podcastProgress && podcastProgress.length > 0) {
          // Convert podcast_id to string to avoid TypeScript errors
          const podcastIds = podcastProgress.map(progress => String(progress.podcast_id));
          
          const { data: podcasts } = await supabase
            .from('podcast_tabela')
            .select('id, titulo, imagem_miniatuta')
            .in('id', podcastIds);

          if (podcasts) {
            recentPodcasts = podcasts.map(podcast => {
              // Use type casting to avoid TypeScript error when comparing string and number
              const progressItem = podcastProgress.find(p => String(p.podcast_id) === String(podcast.id));
              
              return {
                id: podcast.id.toString(),
                title: podcast.titulo || 'Untitled Podcast',
                type: 'podcast' as const,
                thumbnail_url: podcast.imagem_miniatuta || null,
                path: `/podcasts/${podcast.id}`,
                last_accessed: progressItem ? new Date(progressItem.last_played_at) : new Date()
              };
            });
          }
        }

        // Get recent Vade Mecum history
        const { data: articleHistory, error: articleError } = await supabase
          .from('vademecum_history')
          .select('*')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(limit);

        let recentArticles: RecentContent[] = [];
        if (articleHistory && !articleError) {
          recentArticles = articleHistory.map(history => ({
            id: history.article_id,
            title: `Art. ${history.article_number || ''} - ${history.law_name.replace(/_/g, ' ')}`,
            type: 'article' as const,
            path: `/vademecum/${encodeURIComponent(history.law_name)}/${history.article_id}`,
            last_accessed: new Date(history.viewed_at)
          }));
        }

        // Combine all content, sort by last_accessed, and limit
        const allContent = [...recentBooks, ...recentVideos, ...recentPodcasts, ...recentArticles]
          .sort((a, b) => b.last_accessed.getTime() - a.last_accessed.getTime())
          .slice(0, limit);

        setContent(allContent);
      } catch (error) {
        console.error("Error fetching recent content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentContent();
  }, [user, limit]);

  return {
    recentContent: content,
    isLoading,
    hasContent: content.length > 0,
    getMostRecentContentPath: () => content.length > 0 ? content[0].path : '/videoaulas'
  };
}
