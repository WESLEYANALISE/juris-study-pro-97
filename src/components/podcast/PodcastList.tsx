
import React, { useState, useEffect, useMemo } from 'react';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { OptimizedPodcastPlayer } from '@/components/podcast/OptimizedPodcastPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, AlertCircle } from 'lucide-react';
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

// Optimized PodcastList component with memoization and batch state updates
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
  const [filters, setFilters] = useState({
    searchTerm: searchTerm,
    category: category,
    sortBy: sortBy
  });
  const [categories, setCategories] = useState<{name: string; count: number}[]>([]);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Fetch categories for filters - only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('podcast_tabela').select('area');
        
        if (error) throw error;
        
        if (data) {
          // Batch process categories for better performance
          const categoryCounts: Record<string, number> = {};
          
          data.forEach(podcast => {
            if (podcast.area) {
              categoryCounts[podcast.area] = (categoryCounts[podcast.area] || 0) + 1;
            }
          });
          
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

  // Fetch podcasts with memoized query parameters
  useEffect(() => {
    let isMounted = true;
    
    const fetchPodcasts = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('podcast_tabela').select('*');
        
        if (filters.category) {
          query = query.eq('area', filters.category);
        }
        
        if (filters.searchTerm) {
          query = query.or(`titulo.ilike.%${filters.searchTerm}%,descricao.ilike.%${filters.searchTerm}%,tag.ilike.%${filters.searchTerm}%`);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        // Sort based on the sortBy parameter
        switch (filters.sortBy) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('id', { ascending: false });
            break;
          case 'title':
            query = query.order('titulo', { ascending: true });
            break;
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        if (data && isMounted) {
          const processedPodcasts = data.map(item => {
            // Process category data
            const categories = [];
            if (item.area) {
              categories.push({
                name: item.area,
                slug: item.area.toLowerCase().replace(/\s+/g, '-')
              });
            }
            
            // Process tags - optimized
            const tags = item.tag 
              ? (typeof item.tag === 'string' 
                ? item.tag.split(',').map((t: string) => t.trim()) 
                : [item.tag]) 
              : [];
            
            // Add tag categories - batch process
            const tagCategories = tags
              .filter((tag: string) => tag && !categories.some(c => c.name === tag))
              .map((tag: string) => ({
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-')
              }));
            
            return {
              id: item.id.toString(),
              title: item.titulo || 'Sem título',
              description: item.descricao || '',
              audio_url: item.url_audio || '',
              thumbnail_url: item.imagem_miniatuta || '',
              duration: 0,
              published_at: item.created_at || new Date().toISOString(),
              categories: [...categories, ...tagCategories],
              tags,
              area: item.area || 'Geral',
              commentCount: Math.floor(Math.random() * 20),
              likeCount: Math.floor(Math.random() * 100)
            };
          });
          
          setPodcasts(processedPodcasts);
        }
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        if (isMounted) {
          setError('Não foi possível carregar os podcasts. Por favor, tente novamente.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchPodcasts();
    
    return () => {
      isMounted = false;
    };
  }, [filters.searchTerm, filters.category, filters.sortBy, limit]);
  
  // Memoized handlers - ALWAYS declare these regardless of conditions
  const handlePodcastClick = React.useCallback((podcast: any) => {
    // If using the direct parent component handler
    if (onSelectPodcast) {
      onSelectPodcast(podcast);
      return;
    }
    
    // Fetch extra podcast data if needed
    const fetchPodcastDetails = async (podcastToFetch: any) => {
      try {
        // If the podcast doesn't have audio_url, fetch it
        if (!podcastToFetch.audio_url) {
          const { data, error } = await supabase
            .from('podcast_tabela')
            .select('url_audio, descricao')
            .eq('id', Number(podcastToFetch.id))
            .single();
          
          if (error) throw error;
          
          if (data) {
            podcastToFetch.audio_url = data.url_audio || '';
            // Also update description if empty
            if (!podcastToFetch.description && data.descricao) {
              podcastToFetch.description = data.descricao;
            }
          }
        }
        
        setSelectedPodcast(podcastToFetch);
        setShowAdvancedPlayer(true);
      } catch (err) {
        console.error("Error fetching podcast details:", err);
        setError("Não foi possível carregar os detalhes do podcast");
      }
    };
    
    fetchPodcastDetails(podcast);
  }, [onSelectPodcast]);
  
  // Handle state updates in batches for better performance - ALWAYS declare regardless of component state
  const handleFilterChange = React.useCallback((type: string, value: any) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }, []);
  
  // Always create filter component regardless of loading status
  const renderFilters = () => (
    <PodcastFilters
      onSearchChange={(value) => handleFilterChange('searchTerm', value)}
      onCategoryChange={(value) => handleFilterChange('category', value)}
      onSortChange={(value) => handleFilterChange('sortBy', value)}
      categories={categories}
      selectedCategory={filters.category}
    />
  );
  
  // ALWAYS create the podcast grid memo - even if empty or loading
  const podcastGrid = useMemo(() => (
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
  ), [podcasts, handlePodcastClick]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {renderFilters()}
        
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
        {renderFilters()}
      
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
        {renderFilters()}
      
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Nenhum podcast encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {filters.searchTerm && filters.category 
              ? `Não encontramos podcasts com "${filters.searchTerm}" na categoria "${filters.category}"`
              : filters.searchTerm 
                ? `Não encontramos podcasts com "${filters.searchTerm}"`
                : filters.category 
                  ? `Não há podcasts na categoria "${filters.category}"`
                  : 'Não há podcasts disponíveis no momento'}
          </p>
        </div>
      </div>
    );
  }
  
  // Main render - consistent with all other render paths
  return (
    <>
      <div className="space-y-4">
        {renderFilters()}
        {podcastGrid}
      </div>
      
      {/* Immersive Podcast Player Dialog - using the optimized version */}
      <Dialog open={showAdvancedPlayer} onOpenChange={setShowAdvancedPlayer}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedPodcast && (
            <OptimizedPodcastPlayer
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
