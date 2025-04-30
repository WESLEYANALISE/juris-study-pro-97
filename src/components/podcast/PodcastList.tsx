
import { useState, useEffect } from "react";
import { PodcastCard } from "./PodcastCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
  published_at: string;
  categories: { name: string; slug: string }[];
}

interface UserProgress {
  progress_seconds: number;
  completed: boolean;
}

interface PodcastListProps {
  searchTerm?: string;
  category?: string | null;
  sortBy?: string;
  limit?: number;
  showFavoritesOnly?: boolean;
  onSelectPodcast: (podcast: Podcast) => void;
}

export function PodcastList({
  searchTerm = "",
  category = null,
  sortBy = "recent",
  limit,
  showFavoritesOnly = false,
  onSelectPodcast
}: PodcastListProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchPodcasts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('podcasts')
          .select(`
            id, title, description, audio_url, thumbnail_url, duration, published_at,
            podcast_category_links!inner(
              category_id,
              podcast_categories(name, slug)
            )
          `);
        
        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        if (showFavoritesOnly && user) {
          // Get only favorites
          const { data: favoriteIds } = await supabase
            .from('user_podcast_favorites')
            .select('podcast_id')
            .eq('user_id', user.id);
          
          if (favoriteIds && favoriteIds.length > 0) {
            query = query.in('id', favoriteIds.map(f => f.podcast_id));
          } else {
            // If no favorites and showing favorites only
            setPodcasts([]);
            setLoading(false);
            return;
          }
        }
        
        // Apply category filter
        if (category) {
          const { data: categoryData } = await supabase
            .from('podcast_categories')
            .select('id')
            .eq('slug', category)
            .single();
            
          if (categoryData) {
            query = query.in(
              'podcast_category_links.category_id', 
              [categoryData.id]
            );
          }
        }
        
        // Apply sorting
        switch (sortBy) {
          case "recent":
            query = query.order('published_at', { ascending: false });
            break;
          case "alphabetical":
            query = query.order('title', { ascending: true });
            break;
          case "popular":
            // We would need a view count or download count field
            query = query.order('published_at', { ascending: false }); // Fallback to recent
            break;
        }
        
        // Apply limit
        if (limit && limit > 0) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Process data to format categories
        const processedPodcasts = data ? data.map((podcast: any) => {
          const categories = podcast.podcast_category_links
            .map((link: any) => ({
              name: link.podcast_categories.name,
              slug: link.podcast_categories.slug
            }));
          
          return {
            ...podcast,
            categories
          };
        }) : [];
        
        setPodcasts(processedPodcasts);
        
        // Fetch user favorites and progress if logged in
        if (user) {
          const [favoritesResponse, progressResponse] = await Promise.all([
            supabase
              .from('user_podcast_favorites')
              .select('podcast_id')
              .eq('user_id', user.id),
            supabase
              .from('user_podcast_progress')
              .select('podcast_id, progress_seconds, completed')
              .eq('user_id', user.id)
          ]);
          
          if (favoritesResponse.data) {
            const favMap: Record<string, boolean> = {};
            favoritesResponse.data.forEach(fav => {
              favMap[fav.podcast_id] = true;
            });
            setFavorites(favMap);
          }
          
          if (progressResponse.data) {
            const progMap: Record<string, UserProgress> = {};
            progressResponse.data.forEach(prog => {
              progMap[prog.podcast_id] = {
                progress_seconds: prog.progress_seconds,
                completed: prog.completed
              };
            });
            setProgress(progMap);
          }
        }
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPodcasts();
  }, [searchTerm, category, sortBy, limit, showFavoritesOnly, user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {showFavoritesOnly
            ? "Você ainda não adicionou nenhum podcast aos favoritos."
            : "Nenhum podcast encontrado."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {podcasts.map((podcast) => {
        const podcastProgress = progress[podcast.id];
        let progressRatio: number | undefined;
        
        if (podcastProgress) {
          progressRatio = podcastProgress.completed 
            ? 1 
            : (podcast.duration ? podcastProgress.progress_seconds / podcast.duration : 0);
        }
        
        return (
          <PodcastCard
            key={podcast.id}
            id={podcast.id}
            title={podcast.title}
            description={podcast.description}
            thumbnail={podcast.thumbnail_url}
            duration={podcast.duration}
            publishedAt={podcast.published_at}
            isFavorite={!!favorites[podcast.id]}
            progress={progressRatio}
            categories={podcast.categories}
            onClick={() => onSelectPodcast(podcast)}
          />
        );
      })}
    </div>
  );
}
