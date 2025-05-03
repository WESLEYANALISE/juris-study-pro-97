
import { useState, useEffect } from "react";
import { PodcastCard } from "./PodcastCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { getDurationFromAudio } from "@/lib/utils";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
  published_at: string;
  categories: { name: string; slug: string }[];
  tags: string[];
  area: string;
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
  const [audioElement] = useState(new Audio());

  useEffect(() => {
    const fetchPodcasts = async () => {
      setLoading(true);
      try {
        console.log("Fetching podcasts with params:", {
          searchTerm,
          category,
          sortBy,
          limit,
          showFavoritesOnly
        });
        
        // New query to fetch from podcast_tabela
        let query = supabase
          .from('podcast_tabela')
          .select(`
            id, titulo, descricao, url_audio, imagem_miniatuta, tag, area, created_at
          `);
        
        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
        }
        
        if (showFavoritesOnly && user) {
          // Get only favorites
          const { data: favoriteIds } = await supabase
            .from('user_podcast_favorites')
            .select('podcast_id')
            .eq('user_id', user.id);
          
          console.log("Favorite podcast IDs:", favoriteIds);
          
          if (favoriteIds && favoriteIds.length > 0) {
            // Extract podcast IDs as an array
            const podcastIds = favoriteIds.map(f => f.podcast_id);
            console.log("Filtering by podcast IDs:", podcastIds);
            
            // Use the in operator with the array
            query = query.in('id', podcastIds);
          } else {
            // If no favorites and showing favorites only
            setPodcasts([]);
            setLoading(false);
            return;
          }
        }
        
        // Apply category/area filter
        if (category) {
          query = query.eq('area', category);
        }
        
        // Apply sorting
        switch (sortBy) {
          case "recent":
            query = query.order('created_at', { ascending: false });
            break;
          case "alphabetical":
            query = query.order('titulo', { ascending: true });
            break;
          case "popular": // Fallback to recent for now
            query = query.order('created_at', { ascending: false });
            break;
        }
        
        // Apply limit
        if (limit && limit > 0) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching podcasts:", error);
          throw error;
        }
        
        console.log("Raw podcast data:", data);
        
        if (!data || data.length === 0) {
          setPodcasts([]);
          setLoading(false);
          return;
        }

        // Process and transform the data to match our Podcast interface
        const processedPodcasts: Podcast[] = await Promise.all(
          data.map(async (podcast: any) => {
            // Create appropriate category objects from area and tag
            const categories = [];
            
            if (podcast.area) {
              categories.push({
                name: podcast.area,
                slug: podcast.area.toLowerCase().replace(/\s+/g, '-')
              });
            }
            
            if (podcast.tag) {
              // If tag is a comma-separated string, split it
              const tags = typeof podcast.tag === 'string' 
                ? podcast.tag.split(',').map((t: string) => t.trim())
                : [podcast.tag];
                
              tags.forEach((tag: string) => {
                if (tag && !categories.some(c => c.name === tag)) {
                  categories.push({
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, '-')
                  });
                }
              });
            }

            // Get audio duration if not available
            let duration = 0;
            try {
              if (podcast.url_audio) {
                duration = await getDurationFromAudio(podcast.url_audio);
              }
            } catch (err) {
              console.warn("Could not get duration for audio:", podcast.url_audio);
            }
            
            return {
              id: podcast.id.toString(),
              title: podcast.titulo || 'Untitled',
              description: podcast.descricao || '',
              audio_url: podcast.url_audio || '',
              thumbnail_url: podcast.imagem_miniatuta || '',
              duration: duration,
              published_at: podcast.created_at || new Date().toISOString(),
              categories: categories,
              tags: podcast.tag ? (typeof podcast.tag === 'string' ? podcast.tag.split(',').map((t: string) => t.trim()) : [podcast.tag]) : [],
              area: podcast.area || 'Geral'
            };
          })
        );
        
        console.log("Processed podcasts:", processedPodcasts);
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
          
          console.log("User favorites response:", favoritesResponse);
          console.log("User progress response:", progressResponse);
          
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
        toast.error("Erro ao carregar podcasts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPodcasts();
  }, [searchTerm, category, sortBy, limit, showFavoritesOnly, user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {showFavoritesOnly
            ? "Você ainda não adicionou nenhum podcast aos favoritos."
            : "Nenhum podcast encontrado."
          }
        </p>
      </div>
    );
  }

  // Group podcasts by area for better organization
  const groupedPodcasts = podcasts.reduce((acc: Record<string, Podcast[]>, podcast) => {
    const area = podcast.area || 'Outros';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(podcast);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedPodcasts).map(([area, areaPodcasts]) => (
        <div key={area} className="space-y-3">
          <h3 className="text-lg font-medium">{area}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {areaPodcasts.map((podcast) => {
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
                  tags={podcast.tags}
                  area={podcast.area}
                  onClick={() => onSelectPodcast(podcast)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
