
import React, { useState, useEffect } from 'react';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { ImmersivePodcastPlayer } from '@/components/podcast/ImmersivePodcastPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, AlertCircle, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PodcastFilters } from '@/components/podcast/PodcastFilters';
import { useIsMobile } from '@/hooks/use-mobile';

interface PodcastListProps {
  searchTerm?: string;
  category?: string | null;
  sortBy?: 'recent' | 'popular' | 'title';
  showFavoritesOnly?: boolean;
  onSelectPodcast?: (podcast: any) => void;
  limit?: number;
}

export function PodcastList({
  searchTerm = '',
  category = null,
  sortBy = 'recent',
  showFavoritesOnly = false,
  onSelectPodcast,
  limit
}: PodcastListProps) {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<any | null>(null);
  const [showAdvancedPlayer, setShowAdvancedPlayer] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localCategory, setLocalCategory] = useState<string | null>(category);
  const [localSortBy, setLocalSortBy] = useState<string>(sortBy);
  const [categories, setCategories] = useState<{name: string; count: number}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Fetch categories for filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get all podcasts to extract categories
        const { data, error } = await supabase.from('podcast_tabela').select('area');
        
        if (error) throw error;
        
        if (data) {
          // Count podcasts by category
          const categoryCounts: Record<string, number> = {};
          data.forEach(podcast => {
            if (podcast.area) {
              categoryCounts[podcast.area] = (categoryCounts[podcast.area] || 0) + 1;
            }
          });
          
          // Convert to array format needed by PodcastFilters
          const categoryArray = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count
          }));
          
          setCategories(categoryArray);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('podcast_tabela').select('*');
        
        if (localCategory) {
          query = query.eq('area', localCategory);
        }
        
        if (localSearchTerm) {
          query = query.or(`titulo.ilike.%${localSearchTerm}%,descricao.ilike.%${localSearchTerm}%,tag.ilike.%${localSearchTerm}%`);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        // Sort based on the sortBy parameter
        switch (localSortBy) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('id', { ascending: false });
            break;
          case 'alphabetical':
          case 'title':
            query = query.order('titulo', { ascending: true });
            break;
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        if (data) {
          const processedPodcasts = data.map(item => {
            // Process category data
            const categories = [];
            if (item.area) {
              categories.push({
                name: item.area,
                slug: item.area.toLowerCase().replace(/\s+/g, '-')
              });
            }
            
            // Process tags
            const tags = item.tag 
              ? (typeof item.tag === 'string' 
                ? item.tag.split(',').map((t: string) => t.trim()) 
                : [item.tag]) 
              : [];
            
            // Add tag categories
            tags.forEach((tag: string) => {
              if (tag && !categories.some(c => c.name === tag)) {
                categories.push({
                  name: tag,
                  slug: tag.toLowerCase().replace(/\s+/g, '-')
                });
              }
            });
            
            return {
              id: item.id.toString(),
              title: item.titulo || 'Sem título',
              description: item.descricao || '',
              audio_url: item.url_audio || '',
              thumbnail_url: item.imagem_miniatuta || '',
              duration: 0, // Will be determined on play
              published_at: item.created_at || new Date().toISOString(),
              categories,
              tags,
              area: item.area || 'Geral',
              // For demo purposes - would be real data in production
              commentCount: Math.floor(Math.random() * 20),
              likeCount: Math.floor(Math.random() * 100)
            };
          });
          
          setPodcasts(processedPodcasts);
        }
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        setError('Não foi possível carregar os podcasts. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPodcasts();
  }, [localSearchTerm, localCategory, localSortBy, limit]);
  
  // Handle podcast selection
  const handlePodcastClick = async (podcast: any) => {
    // If using the direct parent component handler
    if (onSelectPodcast) {
      onSelectPodcast(podcast);
      return;
    }
    
    // Otherwise use our internal handling with advanced player
    try {
      // If the podcast doesn't have audio_url, fetch it
      if (!podcast.audio_url) {
        const { data, error } = await supabase
          .from('podcast_tabela')
          .select('url_audio, descricao')
          .eq('id', Number(podcast.id))
          .single();
        
        if (error) throw error;
        
        if (data) {
          podcast.audio_url = data.url_audio || '';
          // Also update description if empty
          if (!podcast.description && data.descricao) {
            podcast.description = data.descricao;
          }
        }
      }
      
      setSelectedPodcast(podcast);
      setShowAdvancedPlayer(true);
    } catch (err) {
      console.error("Error fetching podcast details:", err);
      setError("Não foi possível carregar os detalhes do podcast");
    }
  };
  
  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };
  
  const handleCategoryChange = (category: string | null) => {
    setLocalCategory(category);
  };
  
  const handleSortChange = (sort: string) => {
    setLocalSortBy(sort);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Always show filter bar */}
        <PodcastFilters
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={localCategory}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-full aspect-[4/3]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <PodcastFilters
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={localCategory}
        />
      
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Empty state
  if (podcasts.length === 0) {
    return (
      <div className="space-y-4">
        <PodcastFilters
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={localCategory}
        />
      
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Nenhum podcast encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {localSearchTerm && localCategory 
              ? `Não encontramos podcasts com "${localSearchTerm}" na categoria "${localCategory}"`
              : localSearchTerm 
                ? `Não encontramos podcasts com "${localSearchTerm}"`
                : localCategory 
                  ? `Não há podcasts na categoria "${localCategory}"`
                  : 'Não há podcasts disponíveis no momento'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        {/* Always show filters at the top for both mobile and desktop */}
        <PodcastFilters
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={localCategory}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              id={podcast.id}
              title={podcast.title}
              description={podcast.description}
              thumbnail={podcast.thumbnail_url}
              duration={podcast.duration}
              publishedAt={podcast.published_at}
              categories={podcast.categories}
              tags={podcast.tags}
              area={podcast.area}
              commentCount={podcast.commentCount}
              likeCount={podcast.likeCount}
              onClick={() => handlePodcastClick(podcast)}
            />
          ))}
        </div>
      </div>
      
      {/* Immersive Podcast Player Dialog */}
      <Dialog open={showAdvancedPlayer} onOpenChange={setShowAdvancedPlayer}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedPodcast && (
            <ImmersivePodcastPlayer
              id={selectedPodcast.id}
              title={selectedPodcast.title}
              description={selectedPodcast.description}
              audioUrl={selectedPodcast.audio_url}
              thumbnail={selectedPodcast.thumbnail_url}
              author={selectedPodcast.area || "Autor desconhecido"}
              publishedAt={selectedPodcast.published_at}
              categories={selectedPodcast.categories}
              onClose={() => setShowAdvancedPlayer(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
