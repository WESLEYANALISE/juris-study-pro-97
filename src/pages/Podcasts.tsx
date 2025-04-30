import React, { useState, useEffect, useRef } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { motion } from 'framer-motion';
import { AlertCircle, Headphones, Podcast } from "lucide-react";
import { PodcastFilters } from '@/components/podcast/PodcastFilters';
import { PodcastList } from '@/components/podcast/PodcastList';
import { RecentPodcasts } from '@/components/podcast/RecentPodcasts';
import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { AudioPlayerMobile } from '@/components/podcast/AudioPlayerMobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PodcastCard } from '@/components/podcast/PodcastCard';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
  published_at: string;
  categories: { name: string; slug: string }[];
  tags?: string[];
  area?: string;
  progress?: number;
}

const Podcasts = () => {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([]);
  const [inProgressPodcasts, setInProgressPodcasts] = useState<Podcast[]>([]);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const pageBottomRef = useRef<HTMLDivElement>(null);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch available categories from podcast_tabela
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('podcast_tabela')
        .select('area')
        .not('area', 'is', null);

      if (error) {
        console.error('Error fetching podcast categories:', error);
        return;
      }

      if (data) {
        // Aggregate and count categories
        const categoryCounts: Record<string, number> = {};
        
        data.forEach(podcast => {
          if (podcast.area) {
            categoryCounts[podcast.area] = (categoryCounts[podcast.area] || 0) + 1;
          }
        });
        
        // Convert to array format required by filters
        const formattedCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        setCategories(formattedCategories);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured podcasts
  useEffect(() => {
    const fetchFeaturedPodcasts = async () => {
      const { data, error } = await supabase
        .from('podcast_tabela')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching featured podcasts:', error);
        return;
      }

      if (data) {
        const processPodcast = async (item: any) => {
          const categories = [];
          
          if (item.area) {
            categories.push({
              name: item.area,
              slug: item.area.toLowerCase().replace(/\s+/g, '-')
            });
          }
          
          if (item.tag) {
            // Add tags as categories
            const tags = typeof item.tag === 'string' 
              ? item.tag.split(',').map((t: string) => t.trim())
              : [item.tag];
              
            tags.forEach((tag: string) => {
              if (tag && !categories.some(c => c.name === tag)) {
                categories.push({
                  name: tag,
                  slug: tag.toLowerCase().replace(/\s+/g, '-')
                });
              }
            });
          }
          
          return {
            id: item.id.toString(),
            title: item.titulo || 'Untitled',
            description: item.descricao || '',
            audio_url: item.url_audio || '',
            thumbnail_url: item.imagem_miniatuta || '',
            duration: 0, // Will be determined on play
            published_at: item.created_at || new Date().toISOString(),
            categories: categories,
            tags: item.tag ? (typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag]) : [],
            area: item.area || 'Geral'
          };
        };
        
        Promise.all(data.map(processPodcast)).then(processed => {
          setFeaturedPodcasts(processed);
        });
      }
    };

    fetchFeaturedPodcasts();
  }, []);

  // Fetch in-progress podcasts if user is logged in
  useEffect(() => {
    const fetchInProgressPodcasts = async () => {
      if (!user) {
        setInProgressPodcasts([]);
        return;
      }

      const { data: progressData, error: progressError } = await supabase
        .from('user_podcast_progress')
        .select('podcast_id, progress_seconds, completed, last_played_at')
        .eq('user_id', user.id)
        .order('last_played_at', { ascending: false })
        .limit(5);

      if (progressError) {
        console.error('Error fetching podcast progress:', progressError);
        return;
      }

      if (!progressData || progressData.length === 0) {
        setInProgressPodcasts([]);
        return;
      }

      // Get the podcast details for each progress item
      const podcastIds = progressData.map(item => Number(item.podcast_id));
      
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcast_tabela')
        .select('*')
        .in('id', podcastIds);

      if (podcastError) {
        console.error('Error fetching podcast details:', podcastError);
        return;
      }

      if (podcastData) {
        const progressMap = progressData.reduce((acc, item) => {
          acc[item.podcast_id] = {
            progress_seconds: item.progress_seconds,
            completed: item.completed
          };
          return acc;
        }, {} as Record<string, {progress_seconds: number, completed: boolean}>);

        const processPodcast = async (item: any) => {
          const progress = progressMap[item.id];
          
          const categories = [];
          
          if (item.area) {
            categories.push({
              name: item.area,
              slug: item.area.toLowerCase().replace(/\s+/g, '-')
            });
          }
          
          if (item.tag) {
            // Add tags as categories
            const tags = typeof item.tag === 'string' 
              ? item.tag.split(',').map((t: string) => t.trim())
              : [item.tag];
              
            tags.forEach((tag: string) => {
              if (tag && !categories.some(c => c.name === tag)) {
                categories.push({
                  name: tag,
                  slug: tag.toLowerCase().replace(/\s+/g, '-')
                });
              }
            });
          }
          
          return {
            id: item.id.toString(),
            title: item.titulo || 'Untitled',
            description: item.descricao || '',
            audio_url: item.url_audio || '',
            thumbnail_url: item.imagem_miniatuta || '',
            duration: 0, // Will be determined on play
            published_at: item.created_at || new Date().toISOString(),
            categories: categories,
            progress: progress?.completed ? 1 : 0, // Will be calculated in the component
            tags: item.tag ? (typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag]) : [],
            area: item.area || 'Geral'
          };
        };
        
        Promise.all(podcastData.map(processPodcast)).then(processed => {
          setInProgressPodcasts(processed);
        });
      }
    };

    fetchInProgressPodcasts();
  }, [user]);

  // Handle podcast selection with extra data fetch
  const handleSelectPodcast = async (podcast: Podcast) => {
    // If the podcast doesn't have audio_url (like when selected from recent list), fetch it
    if (!podcast.audio_url) {
      try {
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
      } catch (err) {
        console.error("Error fetching podcast audio URL:", err);
        toast.error("Não foi possível carregar o áudio deste podcast");
        return;
      }
    }
    
    setSelectedPodcast(podcast);
    setAudioError(false);
    
    // Scroll to player on mobile
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleAudioError = (error: any) => {
    console.error("Audio playback error:", error);
    setAudioError(true);
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto px-2 md:px-4 py-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 text-center mb-6"
        >
          <div className="relative inline-block mx-auto">
            <div className="flex justify-center mb-2">
              <Podcast className="h-12 w-12 text-primary" />
            </div>
            <motion.span
              className="absolute -inset-8 rounded-full opacity-10 bg-primary blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ zIndex: -1 }}
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Podcasts Jurídicos
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Ouça os melhores conteúdos jurídicos em áudio e aproveite para estudar mesmo em momentos de deslocamento
          </p>
        </motion.div>

        {/* Selected Podcast Player */}
        {selectedPodcast && (
          <div className="mb-6">
            {isMobile ? (
              <AudioPlayerMobile
                id={selectedPodcast.id}
                title={selectedPodcast.title}
                audioUrl={selectedPodcast.audio_url}
                thumbnail={selectedPodcast.thumbnail_url}
                onError={handleAudioError}
                onEnded={() => {
                  toast.success("Podcast concluído!");
                }}
              />
            ) : (
              <AudioPlayer
                id={selectedPodcast.id}
                title={selectedPodcast.title}
                audioUrl={selectedPodcast.audio_url}
                thumbnail={selectedPodcast.thumbnail_url}
                duration={selectedPodcast.duration}
              />
            )}
            
            {audioError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de reprodução</AlertTitle>
                <AlertDescription>
                  Não foi possível reproduzir este podcast. Verifique sua conexão ou tente outro episódio.
                </AlertDescription>
              </Alert>
            )}
            
            {!audioError && (
              <motion.div 
                className="mt-4 bg-primary/5 p-4 rounded-lg border border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="font-medium text-lg mb-2">{selectedPodcast.title}</h3>
                <p className="text-muted-foreground text-sm">{selectedPodcast.description}</p>
                
                {selectedPodcast.categories && selectedPodcast.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">Categorias:</span>
                    {selectedPodcast.categories.map(category => (
                      <span 
                        key={category.slug} 
                        className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded cursor-pointer"
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setSelectedPodcast(null);
                        }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {selectedPodcast.tags && selectedPodcast.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Tags:</span>
                    {selectedPodcast.tags.map((tag, index) => (
                      <span key={index} className="text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Recently played podcasts - only show if no podcast is currently selected */}
        {!selectedPodcast && user && (
          <RecentPodcasts 
            onSelectPodcast={handleSelectPodcast}
            limit={isMobile ? 2 : 4}
          />
        )}

        {/* Featured Podcasts */}
        {featuredPodcasts.length > 0 && !selectedPodcast && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-medium mb-3">Destaques</h2>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {featuredPodcasts.slice(0, 2).map((podcast) => (
                  <Card 
                    key={podcast.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden border-primary/10"
                    onClick={() => handleSelectPodcast(podcast)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={podcast.thumbnail_url || "https://via.placeholder.com/300x200?text=Podcast"} 
                        alt={podcast.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                        <h3 className="text-white font-medium text-sm line-clamp-1">{podcast.title}</h3>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Carousel>
                <CarouselContent>
                  {featuredPodcasts.map((podcast) => (
                    <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="cursor-pointer h-full hover:shadow-md transition-shadow overflow-hidden border-primary/10" onClick={() => handleSelectPodcast(podcast)}>
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={podcast.thumbnail_url || "https://via.placeholder.com/300x200?text=Podcast"} 
                            alt={podcast.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white font-semibold line-clamp-1">{podcast.title}</h3>
                            <p className="text-white/90 text-sm line-clamp-1">{podcast.description}</p>
                          </div>
                          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs flex items-center">
                            <Headphones className="h-3 w-3 mr-1" />
                            Ouvir agora
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            )}
          </motion.div>
        )}

        <PodcastFilters 
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
          categories={categories}
          selectedCategory={selectedCategory}
        />
        
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos os Episódios</TabsTrigger>
            <TabsTrigger value="favorites">Meus Favoritos</TabsTrigger>
            <TabsTrigger value="inProgress">Em andamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              onSelectPodcast={handleSelectPodcast}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              showFavoritesOnly={true}
              onSelectPodcast={handleSelectPodcast}
            />
          </TabsContent>
          
          <TabsContent value="inProgress">
            {inProgressPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inProgressPodcasts.map((podcast) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PodcastCard
                      id={podcast.id}
                      title={podcast.title}
                      description={podcast.description}
                      thumbnail={podcast.thumbnail_url}
                      duration={podcast.duration}
                      publishedAt={podcast.published_at}
                      progress={podcast.progress}
                      categories={podcast.categories}
                      tags={podcast.tags}
                      area={podcast.area}
                      onClick={() => handleSelectPodcast(podcast)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nenhum podcast em andamento</AlertTitle>
                <AlertDescription>
                  Você ainda não começou a ouvir nenhum podcast. Comece a ouvir e seus episódios em andamento aparecerão aqui.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8" />
        
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3">Baixe nosso app</h2>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Continue ouvindo mesmo com o app fechado, crie playlists personalizadas e receba notificações de novos episódios.
          </p>
          <motion.div 
            className="flex justify-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button 
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Download para iOS
            </motion.button>
            <motion.button 
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Download para Android
            </motion.button>
          </motion.div>
        </div>
        
        {/* Reference for auto-scrolling */}
        <div ref={pageBottomRef} />
      </div>
    </JuridicalBackground>
  );
};

export default Podcasts;
