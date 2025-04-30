
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeTime } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { Headphones, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface RecentPodcast {
  id: string;
  title: string;
  thumbnail_url: string;
  progress_seconds: number;
  duration: number;
  last_played_at: string;
}

interface RecentPodcastsProps {
  onSelectPodcast: (podcast: any) => void;
  limit?: number;
}

export function RecentPodcasts({ onSelectPodcast, limit = 4 }: RecentPodcastsProps) {
  const [recentPodcasts, setRecentPodcasts] = useState<RecentPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRecentPodcasts = async () => {
      if (!user) {
        setRecentPodcasts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get recent podcast progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_podcast_progress')
          .select('podcast_id, progress_seconds, completed, last_played_at')
          .eq('user_id', user.id)
          .order('last_played_at', { ascending: false })
          .limit(limit);
        
        if (progressError) {
          throw progressError;
        }
        
        if (!progressData || progressData.length === 0) {
          setRecentPodcasts([]);
          setLoading(false);
          return;
        }
        
        // Get podcast details
        const podcastIds = progressData.map(item => Number(item.podcast_id));
        
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcast_tabela')
          .select('id, titulo, descricao, url_audio, imagem_miniatuta')
          .in('id', podcastIds);
        
        if (podcastError) {
          throw podcastError;
        }
        
        // Combine podcast data with progress data
        const combinedData = progressData.map(progress => {
          const podcast = podcastData?.find(p => p.id === Number(progress.podcast_id));
          
          if (!podcast) return null;
          
          return {
            id: podcast.id.toString(),
            title: podcast.titulo || 'Sem título',
            thumbnail_url: podcast.imagem_miniatuta || '',
            progress_seconds: progress.progress_seconds,
            duration: 0, // Will be determined on play
            last_played_at: progress.last_played_at
          };
        }).filter(Boolean) as RecentPodcast[];
        
        setRecentPodcasts(combinedData);
      } catch (err) {
        console.error('Error fetching recent podcasts:', err);
        toast.error("Não foi possível carregar podcasts recentes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentPodcasts();
  }, [user, limit]);
  
  if (loading) {
    return (
      <div className="my-4">
        <LoadingState variant="skeleton" count={limit} height="h-16" />
      </div>
    );
  }
  
  if (recentPodcasts.length === 0) {
    return null; // Don't show anything if no recent podcasts
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Clock className="mr-2 h-4 w-4 text-primary" />
        Ouvidos recentemente
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {recentPodcasts.map((podcast) => (
          <Card 
            key={podcast.id} 
            className="cursor-pointer border-primary/10 hover:border-primary/30 transition-all"
            onClick={() => {
              const fullPodcast = {
                id: podcast.id,
                title: podcast.title,
                audio_url: '',  // Will be filled in when fetched
                thumbnail_url: podcast.thumbnail_url,
                duration: podcast.duration
              };
              onSelectPodcast(fullPodcast);
            }}
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                {podcast.thumbnail_url ? (
                  <img 
                    src={podcast.thumbnail_url} 
                    alt={podcast.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{podcast.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(podcast.last_played_at))}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
