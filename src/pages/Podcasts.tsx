import React, { useState, useEffect, useRef } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { motion } from 'framer-motion';
import { AlertCircle, Headphones, Podcast, Heart, MessageSquare, Clock, List } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
  published_at: string;
  categories: {
    name: string;
    slug: string;
  }[];
  tags?: string[];
  area?: string;
  progress?: number;
  commentCount?: number;
  likeCount?: number;
}

interface PodcastComment {
  id: string;
  podcast_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

const Podcasts = () => {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Fix sortBy type to be one of allowed string literals
  const [sortBy, setSortBy] = useState<"title" | "recent" | "popular">("recent");
  const [categories, setCategories] = useState<{
    name: string;
    count: number;
  }[]>([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([]);
  const [inProgressPodcasts, setInProgressPodcasts] = useState<Podcast[]>([]);
  const [comments, setComments] = useState<PodcastComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [currentTab, setCurrentTab] = useState("all");
  const [showComments, setShowComments] = useState(false);

  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const pageBottomRef = useRef<HTMLDivElement>(null);
  const [audioError, setAudioError] = useState<boolean>(false);

  // Fetch available categories from podcast_tabela
  useEffect(() => {
    const fetchCategories = async () => {
      const {
        data,
        error
      } = await supabase.from('podcast_tabela').select('area').not('area', 'is', null);
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
        const formattedCategories = Object.entries(categoryCounts).map(([name, count]) => ({
          name,
          count
        })).sort((a, b) => b.count - a.count);
        setCategories(formattedCategories);
      }
    };
    fetchCategories();
  }, []);

  // Fetch featured podcasts
  useEffect(() => {
    const fetchFeaturedPodcasts = async () => {
      const {
        data,
        error
      } = await supabase.from('podcast_tabela').select('*').order('created_at', {
        ascending: false
      }).limit(5);
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
            const tags = typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag];
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
            duration: 0,
            // Will be determined on play
            published_at: item.created_at || new Date().toISOString(),
            categories: categories,
            tags: item.tag ? typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag] : [],
            area: item.area || 'Geral',
            likeCount: Math.floor(Math.random() * 50), // Placeholder until we implement real likes
            commentCount: Math.floor(Math.random() * 10) // Placeholder until we implement real comments
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
      const {
        data: progressData,
        error: progressError
      } = await supabase.from('user_podcast_progress').select('podcast_id, progress_seconds, completed, last_played_at').eq('user_id', user.id).order('last_played_at', {
        ascending: false
      }).limit(5);
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
      const {
        data: podcastData,
        error: podcastError
      } = await supabase.from('podcast_tabela').select('*').in('id', podcastIds);
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
        }, {} as Record<string, {
          progress_seconds: number;
          completed: boolean;
        }>);
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
            const tags = typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag];
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
            duration: 0,
            // Will be determined on play
            published_at: item.created_at || new Date().toISOString(),
            categories: categories,
            progress: progress?.completed ? 1 : 0,
            // Will be calculated in the component
            tags: item.tag ? typeof item.tag === 'string' ? item.tag.split(',').map((t: string) => t.trim()) : [item.tag] : [],
            area: item.area || 'Geral',
            likeCount: Math.floor(Math.random() * 50), // Placeholder
            commentCount: Math.floor(Math.random() * 10) // Placeholder
          };
        };
        Promise.all(podcastData.map(processPodcast)).then(processed => {
          setInProgressPodcasts(processed);
        });
      }
    };
    fetchInProgressPodcasts();
  }, [user]);

  // Fetch comments for selected podcast
  useEffect(() => {
    if (selectedPodcast && showComments) {
      const fetchComments = async () => {
        // This is a placeholder until we implement the real comment system
        // For now, we'll just generate some mock comments
        const mockComments: PodcastComment[] = [
          {
            id: '1',
            podcast_id: selectedPodcast.id,
            user_id: '1',
            user_name: 'Ana Silva',
            user_avatar: 'https://i.pravatar.cc/150?img=1',
            content: 'Excelente podcast! Aprendi muito sobre este tema específico.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
          },
          {
            id: '2',
            podcast_id: selectedPodcast.id,
            user_id: '2',
            user_name: 'Carlos Mendes',
            user_avatar: 'https://i.pravatar.cc/150?img=3',
            content: 'Gostaria de saber se haverá uma continuação deste tema em episódios futuros.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
          },
          {
            id: '3',
            podcast_id: selectedPodcast.id,
            user_id: '3',
            user_name: 'Mariana Costa',
            user_avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'Tem alguma bibliografia recomendada para aprofundar neste assunto?',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
          }
        ];
        
        setComments(mockComments);
      };
      
      fetchComments();
    }
  }, [selectedPodcast, showComments]);

  // Handle podcast selection with extra data fetch
  const handleSelectPodcast = async (podcast: Podcast) => {
    // If the podcast doesn't have audio_url (like when selected from recent list), fetch it
    if (!podcast.audio_url) {
      try {
        const {
          data,
          error
        } = await supabase.from('podcast_tabela').select('url_audio, descricao').eq('id', Number(podcast.id)).single();
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
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  };
  
  const handleAudioError = (error: any) => {
    console.error("Audio playback error:", error);
    setAudioError(true);
  };
  
  const handleCommentSubmit = () => {
    if (!commentInput.trim() || !selectedPodcast || !user) return;
    
    // In a real implementation, this would save to the database
    const newComment: PodcastComment = {
      id: Date.now().toString(),
      podcast_id: selectedPodcast.id,
      user_id: user.id,
      user_name: user.email?.split('@')[0] || 'Usuário',
      user_avatar: undefined,
      content: commentInput,
      created_at: new Date().toISOString()
    };
    
    setComments([newComment, ...comments]);
    setCommentInput('');
    toast.success("Comentário adicionado com sucesso!");
  };

  const toggleLike = (podcast: Podcast) => {
    if (!user) {
      toast.error("Faça login para curtir este podcast");
      return;
    }
    
    toast.success("Podcast adicionado aos seus favoritos!");
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto px-2 md:px-4 py-6 pb-24">
        <motion.div 
          initial={{opacity: 0, y: -20}} 
          animate={{opacity: 1, y: 0}} 
          transition={{duration: 0.5}} 
          className="space-y-2 text-center mb-6"
        >
          <div className="relative inline-block mx-auto">
            <div className="flex justify-center mb-2">
              <Podcast className="h-12 w-12 text-primary" />
            </div>
            <motion.span 
              className="absolute -inset-8 rounded-full opacity-10 bg-primary blur-xl" 
              initial={{scale: 0.8, opacity: 0}} 
              animate={{scale: 1, opacity: 0.1}} 
              transition={{duration: 0.5, delay: 0.2}} 
              style={{zIndex: -1}} 
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
                onEnded={() => {toast.success("Podcast concluído!");}}
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
                initial={{opacity: 0, y: 20}} 
                animate={{opacity: 1, y: 0}} 
                transition={{duration: 0.3, delay: 0.2}}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg mb-2">{selectedPodcast.title}</h3>
                    <p className="text-muted-foreground text-sm">{selectedPodcast.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleLike(selectedPodcast)}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={toggleComments}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
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
                
                {/* Comments Section */}
                {showComments && (
                  <motion.div 
                    className="mt-4"
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    transition={{duration: 0.3}}
                  >
                    <Separator className="my-4" />
                    <h4 className="font-medium mb-3">Comentários</h4>
                    
                    {user ? (
                      <div className="flex gap-3 mb-4">
                        <Avatar>
                          <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            placeholder="Adicione um comentário..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleCommentSubmit}
                            disabled={!commentInput.trim()}
                          >
                            Comentar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">
                        Faça login para adicionar comentários.
                      </p>
                    )}
                    
                    <ScrollArea className="h-[250px] pr-4">
                      {comments.length > 0 ? (
                        <div className="space-y-4">
                          {comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar>
                                {comment.user_avatar ? (
                                  <AvatarImage src={comment.user_avatar} />
                                ) : (
                                  <AvatarFallback>{comment.user_name[0].toUpperCase()}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{comment.user_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum comentário ainda. Seja o primeiro a comentar!
                        </p>
                      )}
                    </ScrollArea>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Recently played podcasts - only show if no podcast is currently selected */}
        {!selectedPodcast && user && (
          <RecentPodcasts onSelectPodcast={handleSelectPodcast} limit={isMobile ? 2 : 4} />
        )}

        {/* Featured Podcasts */}
        {featuredPodcasts.length > 0 && !selectedPodcast && (
          <motion.div 
            className="mb-6" 
            initial={{opacity: 0, y: 20}} 
            animate={{opacity: 1, y: 0}} 
            transition={{duration: 0.5, delay: 0.2}}
          >
            <h2 className="text-xl font-medium mb-3">Destaques</h2>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {featuredPodcasts.slice(0, 2).map(podcast => (
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
                    onClick={() => handleSelectPodcast(podcast)}
                  />
                ))}
              </div>
            ) : (
              <Carousel>
                <CarouselContent>
                  {featuredPodcasts.map(podcast => (
                    <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3">
                      <PodcastCard 
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
                        onClick={() => handleSelectPodcast(podcast)}
                      />
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
          onSortChange={(sort: "title" | "recent" | "popular") => setSortBy(sort)} 
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
                {inProgressPodcasts.map(podcast => (
                  <motion.div 
                    key={podcast.id}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
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
                      commentCount={podcast.commentCount}
                      likeCount={podcast.likeCount}
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
        
        {/* Reference for auto-scrolling */}
        <div ref={pageBottomRef} />
      </div>
    </JuridicalBackground>
  );
};

export default Podcasts;
