import React, { useState, useEffect } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { motion } from 'framer-motion';
import { AlertCircle, Headphones, Podcast } from "lucide-react";
import { PodcastFilters } from '@/components/podcast/PodcastFilters';
import { PodcastList } from '@/components/podcast/PodcastList';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
        .select('podcast_id, progress_seconds, completed')
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
      const podcastIds = progressData.map(item => item.podcast_id.toString());
      
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
            progress: progress.completed ? 1 : 0, // Will be calculated in the component
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

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto px-2 md:px-4 py-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 text-center mb-8"
        >
          <div className="relative inline-block mx-auto">
            <div className="flex justify-center mb-3">
              <Podcast className="h-16 w-16 text-primary" />
            </div>
            <motion.span
              className="absolute -inset-10 rounded-full opacity-10 bg-primary blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ zIndex: -1 }}
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Podcasts Jurídicos
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ouça os melhores conteúdos jurídicos em áudio e aproveite para estudar mesmo em momentos de deslocamento
          </p>
        </motion.div>

        {/* Featured Podcasts */}
        {featuredPodcasts.length > 0 && !selectedPodcast && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4">Destaques</h2>
            <Carousel>
              <CarouselContent>
                {featuredPodcasts.map((podcast) => (
                  <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="cursor-pointer h-full hover:shadow-md transition-shadow overflow-hidden border-primary/10" onClick={() => setSelectedPodcast(podcast)}>
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
          </motion.div>
        )}

        {selectedPodcast && (
          <div className="mb-8">
            <AudioPlayer
              id={selectedPodcast.id}
              title={selectedPodcast.title}
              audioUrl={selectedPodcast.audio_url}
              thumbnail={selectedPodcast.thumbnail_url}
              duration={selectedPodcast.duration}
            />
            <motion.div 
              className="mt-6 bg-primary/5 p-5 rounded-lg border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="font-medium text-xl mb-2">{selectedPodcast.title}</h3>
              <p className="text-muted-foreground">{selectedPodcast.description}</p>
              
              {selectedPodcast.categories && selectedPodcast.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Categorias:</span>
                  {selectedPodcast.categories.map(category => (
                    <span 
                      key={category.slug} 
                      className="text-sm text-primary bg-primary/10 px-2 py-0.5 rounded"
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
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  {selectedPodcast.tags.map((tag, index) => (
                    <span key={index} className="text-sm text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        <PodcastFilters 
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
          categories={categories}
          selectedCategory={selectedCategory}
        />
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos os Episódios</TabsTrigger>
            <TabsTrigger value="favorites">Meus Favoritos</TabsTrigger>
            <TabsTrigger value="inProgress">Em andamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              onSelectPodcast={setSelectedPodcast}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              showFavoritesOnly={true}
              onSelectPodcast={setSelectedPodcast}
            />
          </TabsContent>
          
          <TabsContent value="inProgress">
            {inProgressPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inProgressPodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
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
                    onClick={() => setSelectedPodcast(podcast)}
                  />
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
        
        <Separator className="my-12" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Baixe nosso app</h2>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Continue ouvindo mesmo com o app fechado, crie playlists personalizadas e receba notificações de novos episódios.
          </p>
          <motion.div 
            className="flex justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button 
              className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Download para iOS
            </motion.button>
            <motion.button 
              className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Download para Android
            </motion.button>
          </motion.div>
        </div>
      </div>
    </JuridicalBackground>
  );
};

export default Podcasts;
