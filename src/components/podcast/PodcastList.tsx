import React, { useState, useEffect } from 'react';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { AdvancedPodcastPlayer } from '@/components/podcast/AdvancedPodcastPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('podcast_tabela').select('*');
        
        if (category) {
          query = query.eq('area', category);
        }
        
        if (searchTerm) {
          query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,tag.ilike.%${searchTerm}%`);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        // Sort based on the sortBy parameter
        switch (sortBy) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            // For now, we don't have a real popularity metric
            // In a real app, you might order by listens or likes
            query = query.order('id', { ascending: false });
            break;
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
  }, [searchTerm, category, sortBy, limit]);
  
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="w-full aspect-[4/3]" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // Empty state
  if (podcasts.length === 0) {
    return (
      <div className="text-center py-16">
        <Music className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhum podcast encontrado</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {searchTerm && category 
            ? `Não encontramos podcasts com "${searchTerm}" na categoria "${category}"`
            : searchTerm 
              ? `Não encontramos podcasts com "${searchTerm}"`
              : category 
                ? `Não há podcasts na categoria "${category}"`
                : 'Não há podcasts disponíveis no momento'}
        </p>
      </div>
    );
  }
  
  return (
    <>
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
      
      {/* Advanced Podcast Player Dialog */}
      <Dialog open={showAdvancedPlayer} onOpenChange={setShowAdvancedPlayer}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedPodcast && (
            <AdvancedPodcastPlayer
              id={selectedPodcast.id}
              title={selectedPodcast.title}
              description={selectedPodcast.description}
              audioUrl={selectedPodcast.audio_url}
              imageUrl={selectedPodcast.thumbnail_url}
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
