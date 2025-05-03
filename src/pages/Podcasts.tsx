
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Podcast, Heart, MessageSquare, Clock, 
  Menu, X, Library, Filter, LayoutGrid, LayoutList
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PodcastCard } from '@/components/podcast/PodcastCard';
import { ImmersivePodcastPlayer } from '@/components/podcast/ImmersivePodcastPlayer';
import { SoundscapeCard } from '@/components/ui/soundscape-theme';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from "sonner";

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

const Podcasts = () => {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "title">("recent");
  const [categories, setCategories] = useState<{
    name: string;
    count: number;
  }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([]);
  const [inProgressPodcasts, setInProgressPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'progress' | 'favorites'>('all');

  const { user } = useAuth();
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect to filter podcasts based on search and categories
  useEffect(() => {
    if (!allPodcasts.length) {
      setFilteredPodcasts([]);
      return;
    }
    
    let result = [...allPodcasts];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        podcast => 
          podcast.title.toLowerCase().includes(search) || 
          podcast.description.toLowerCase().includes(search) ||
          podcast.categories.some(cat => cat.name.toLowerCase().includes(search)) ||
          (podcast.tags && podcast.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(
        podcast => 
          podcast.categories.some(cat => cat.name === selectedCategory) ||
          podcast.area === selectedCategory
      );
    }
    
    // Apply filters for progress/favorites (mock implementation)
    if (activeFilter === 'progress') {
      result = inProgressPodcasts;
    } else if (activeFilter === 'favorites') {
      // Mock favorite filter
      result = result.filter(podcast => podcast.id.length % 2 === 0); // Just a demo filter
    }
    
    // Apply sorting
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case "popular":
        result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    setFilteredPodcasts(result);
  }, [allPodcasts, searchTerm, selectedCategory, sortBy, activeFilter, inProgressPodcasts]);

  // Fetch podcasts and categories
  useEffect(() => {
    const fetchPodcasts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('podcast_tabela')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Process podcast data
          const processedPodcasts = await Promise.all(data.map(async (item) => {
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
          }));
          
          setAllPodcasts(processedPodcasts);
          
          // Set featured podcasts
          setFeaturedPodcasts(processedPodcasts.slice(0, 5));
          
          // Mock in-progress podcasts
          setInProgressPodcasts(processedPodcasts.slice(5, 8));
          
          // Extract categories
          const categoryMap = new Map<string, number>();
          processedPodcasts.forEach(podcast => {
            podcast.categories.forEach(category => {
              const currentCount = categoryMap.get(category.name) || 0;
              categoryMap.set(category.name, currentCount + 1);
            });
          });
          
          const categoryArray = Array.from(categoryMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          
          setCategories(categoryArray);
        }
      } catch (err) {
        console.error("Error fetching podcasts:", err);
        toast.error("Erro ao carregar podcasts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPodcasts();
  }, []);

  // Handle podcast selection
  const handleSelectPodcast = async (podcast: Podcast) => {
    // If the podcast doesn't have audio_url, fetch it
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
        console.error("Error fetching podcast details:", err);
        toast.error("Não foi possível carregar os detalhes do podcast");
        return;
      }
    }
    
    setSelectedPodcast(podcast);
  };
  
  const handleClosePodcast = () => {
    setSelectedPodcast(null);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setActiveFilter('all');
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black">
      <AnimatePresence>
        {selectedPodcast && (
          <ImmersivePodcastPlayer
            id={selectedPodcast.id}
            title={selectedPodcast.title}
            description={selectedPodcast.description}
            audioUrl={selectedPodcast.audio_url}
            thumbnail={selectedPodcast.thumbnail_url}
            author={selectedPodcast.area}
            publishedAt={selectedPodcast.published_at}
            categories={selectedPodcast.categories}
            onClose={handleClosePodcast}
          />
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Hero section with parallax effect */}
        <motion.div 
          className="relative h-64 md:h-80 mb-8 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background image with parallax */}
          <div 
            className="absolute inset-0 bg-[url('/podcast-background.jpg')] bg-cover bg-center"
            style={{ 
              transform: `translateY(${scrollPosition * 0.15}px)` 
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/80 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300 mb-2">
              Soundscape
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl">
              Explore conteúdo jurídico em áudio para aprender enquanto se desloca
            </p>
            
            {/* Search bar with glass effect */}
            <div className="relative mt-6 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <Input 
                placeholder="Buscar podcast por título, tema ou categoria..." 
                className="pl-10 bg-black/30 backdrop-blur-md border-purple-700/30 focus:border-purple-500/50 shadow-lg text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </motion.div>
        
        {/* Mobile filter sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="fixed bottom-4 right-4 z-40 md:hidden rounded-full h-14 w-14 shadow-lg bg-purple-600 hover:bg-purple-500 border-none"
            >
              <Filter className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black/90 backdrop-blur-xl border-r border-purple-900/30">
            <div className="flex items-center mb-8 pt-4">
              <Podcast className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-xl font-bold text-purple-400">Soundscape</h2>
            </div>
            
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-purple-500/70 mb-3">Filtros</h3>
                  <div className="space-y-1">
                    {(['all', 'progress', 'favorites'] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left",
                          activeFilter === filter ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                        )}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {{
                          all: <Library className="mr-2 h-4 w-4" />,
                          progress: <Clock className="mr-2 h-4 w-4" />,
                          favorites: <Heart className="mr-2 h-4 w-4" />
                        }[filter]}
                        {filter === 'all' ? 'Todos' : 
                         filter === 'progress' ? 'Em Progresso' : 'Favoritos'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-purple-500/70 mb-3">Ordenação</h3>
                  <div className="space-y-1">
                    {(['recent', 'popular', 'title'] as const).map((sort) => (
                      <Button
                        key={sort}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left",
                          sortBy === sort ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                        )}
                        onClick={() => setSortBy(sort)}
                      >
                        {sort === 'recent' ? 'Mais Recentes' : 
                         sort === 'popular' ? 'Mais Populares' : 'Por Título'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator className="border-purple-900/30" />
                
                <div>
                  <h3 className="text-sm font-medium text-purple-500/70 mb-3">Categorias</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Button
                        key={category.name}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left",
                          selectedCategory === category.name ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                        )}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        {category.name}
                        <Badge className="ml-auto bg-purple-900/30 text-purple-500" variant="outline">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-700 text-purple-400"
                    onClick={resetFilters}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-6 space-y-6">
              <SoundscapeCard className="p-4">
                <h3 className="text-sm font-medium text-purple-500/70 mb-3">Filtros</h3>
                <div className="space-y-1">
                  {(['all', 'progress', 'favorites'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left",
                        activeFilter === filter ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                      )}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {{
                        all: <Library className="mr-2 h-4 w-4" />,
                        progress: <Clock className="mr-2 h-4 w-4" />,
                        favorites: <Heart className="mr-2 h-4 w-4" />
                      }[filter]}
                      {filter === 'all' ? 'Todos' : 
                       filter === 'progress' ? 'Em Progresso' : 'Favoritos'}
                    </Button>
                  ))}
                </div>
              </SoundscapeCard>
              
              <SoundscapeCard className="p-4">
                <h3 className="text-sm font-medium text-purple-500/70 mb-3">Ordenação</h3>
                <div className="space-y-1">
                  {(['recent', 'popular', 'title'] as const).map((sort) => (
                    <Button
                      key={sort}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left",
                        sortBy === sort ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                      )}
                      onClick={() => setSortBy(sort)}
                    >
                      {sort === 'recent' ? 'Mais Recentes' : 
                       sort === 'popular' ? 'Mais Populares' : 'Por Título'}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      "border-purple-700/30",
                      viewMode === 'grid' && "bg-purple-800/30"
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      "border-purple-700/30",
                      viewMode === 'list' && "bg-purple-800/30"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </SoundscapeCard>
              
              <SoundscapeCard className="p-4">
                <h3 className="text-sm font-medium text-purple-500/70 mb-3">Categorias</h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Button
                        key={category.name}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left",
                          selectedCategory === category.name ? "bg-purple-900/20 text-purple-400" : "text-gray-300"
                        )}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <span className="truncate">{category.name}</span>
                        <Badge className="ml-auto bg-purple-900/30 text-purple-500" variant="outline">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedCategory && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-purple-400"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Limpar Categoria
                  </Button>
                )}
              </SoundscapeCard>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeFilter}-${selectedCategory}-${searchTerm}-${sortBy}-${viewMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {/* Filter status */}
                {(selectedCategory || searchTerm || activeFilter !== 'all') && (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-purple-900/20 p-3 rounded-md border border-purple-800/30">
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCategory && (
                        <Badge variant="outline" className="bg-purple-900/40 text-purple-300">
                          Categoria: {selectedCategory}
                        </Badge>
                      )}
                      
                      {searchTerm && (
                        <Badge variant="outline" className="bg-purple-900/40 text-purple-300">
                          Busca: {searchTerm}
                        </Badge>
                      )}
                      
                      {activeFilter !== 'all' && (
                        <Badge variant="outline" className="bg-purple-900/40 text-purple-300">
                          {activeFilter === 'progress' ? 'Em Progresso' : 'Favoritos'}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-purple-400"
                      onClick={resetFilters}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                )}
                
                {/* Featured podcasts (when no filters are applied) */}
                {!selectedCategory && !searchTerm && activeFilter === 'all' && (
                  <section>
                    <motion.h2 
                      className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Destaques
                    </motion.h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredPodcasts.slice(0, 3).map((podcast, index) => (
                        <motion.div
                          key={podcast.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * (index + 1) }}
                        >
                          <SoundscapeCard
                            className="group cursor-pointer h-full"
                            onClick={() => handleSelectPodcast(podcast)}
                          >
                            <div className="relative aspect-video rounded-md overflow-hidden mb-3">
                              <img
                                src={podcast.thumbnail_url || "/podcast-placeholder.jpg"}
                                alt={podcast.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/podcast-placeholder.jpg";
                                }}
                              />
                              
                              {/* Play button overlay */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full bg-purple-600/80 p-3">
                                  <Podcast className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <h3 className="font-bold text-white mb-1 line-clamp-1">{podcast.title}</h3>
                              <p className="text-sm text-purple-300/80 mb-2">{podcast.area}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{podcast.description}</p>
                              
                              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <span>{formatDate(podcast.published_at)}</span>
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {podcast.commentCount}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {podcast.likeCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </SoundscapeCard>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
                
                {/* In progress podcasts (when relevant) */}
                {(activeFilter === 'all' || activeFilter === 'progress') && inProgressPodcasts.length > 0 && (
                  <section>
                    <motion.h2 
                      className="text-2xl font-bold mb-4 text-purple-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Continue Ouvindo
                    </motion.h2>
                    
                    <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 snap-x">
                      {inProgressPodcasts.map((podcast, index) => (
                        <motion.div
                          key={podcast.id}
                          className="min-w-[300px] snap-start"
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (index * 0.1) }}
                        >
                          <SoundscapeCard
                            className="cursor-pointer h-full"
                            onClick={() => handleSelectPodcast(podcast)}
                          >
                            <div className="flex gap-3 p-3">
                              <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                                <img
                                  src={podcast.thumbnail_url || "/podcast-placeholder.jpg"}
                                  alt={podcast.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/podcast-placeholder.jpg";
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-medium text-white mb-1 line-clamp-1">{podcast.title}</h3>
                                <p className="text-xs text-purple-300/80 mb-1">{podcast.area}</p>
                                
                                {/* Progress bar */}
                                <div className="h-1 bg-purple-900/50 rounded-full mt-2 mb-1">
                                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
                                </div>
                                <p className="text-xs text-muted-foreground">65% concluído</p>
                              </div>
                            </div>
                          </SoundscapeCard>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
                
                {/* Main podcast grid/list */}
                <section>
                  <motion.h2 
                    className="text-2xl font-bold mb-4 text-purple-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {selectedCategory ? `Podcasts: ${selectedCategory}` : 
                     searchTerm ? `Resultados para: "${searchTerm}"` : 
                     activeFilter === 'progress' ? 'Em Progresso' :
                     activeFilter === 'favorites' ? 'Seus Favoritos' : 
                     'Todos os Podcasts'}
                  </motion.h2>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <SoundscapeCard key={index} className="h-72 animate-pulse">
                          <div className="h-40 bg-purple-900/30" />
                          <div className="p-4 space-y-2">
                            <div className="h-5 bg-purple-900/30 rounded w-3/4" />
                            <div className="h-4 bg-purple-900/30 rounded w-1/2" />
                            <div className="h-3 bg-purple-900/30 rounded w-full" />
                          </div>
                        </SoundscapeCard>
                      ))}
                    </div>
                  ) : filteredPodcasts.length === 0 ? (
                    <SoundscapeCard className="p-8 text-center">
                      <Podcast className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <h3 className="text-xl font-bold text-purple-400 mb-2">
                        Nenhum podcast encontrado
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {searchTerm 
                          ? `Não encontramos resultados para "${searchTerm}".` 
                          : selectedCategory 
                            ? `Não há podcasts na categoria "${selectedCategory}".`
                            : activeFilter !== 'all'
                              ? `Não há podcasts ${activeFilter === 'progress' ? 'em progresso' : 'nos favoritos'}.`
                              : 'Não há podcasts disponíveis no momento.'}
                      </p>
                      <Button 
                        onClick={resetFilters}
                        className="bg-purple-600 hover:bg-purple-500"
                      >
                        Limpar Filtros
                      </Button>
                    </SoundscapeCard>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPodcasts.map((podcast, index) => (
                        <motion.div
                          key={podcast.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * (index % 6) }}
                        >
                          <SoundscapeCard
                            className="group cursor-pointer h-full"
                            onClick={() => handleSelectPodcast(podcast)}
                            waveColor={`hsl(${(index * 20) % 360}, 70%, 60%)`}
                          >
                            <div className="relative aspect-video rounded-md overflow-hidden mb-3">
                              <img
                                src={podcast.thumbnail_url || "/podcast-placeholder.jpg"}
                                alt={podcast.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/podcast-placeholder.jpg";
                                }}
                              />
                              
                              {/* Play button overlay */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="rounded-full bg-purple-600/80 p-3">
                                  <Podcast className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <h3 className="font-bold text-white mb-1 line-clamp-1">{podcast.title}</h3>
                              <p className="text-sm text-purple-300/80 mb-2">{podcast.area}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{podcast.description}</p>
                              
                              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <span>{formatDate(podcast.published_at)}</span>
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {podcast.commentCount}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {podcast.likeCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </SoundscapeCard>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPodcasts.map((podcast, index) => (
                        <motion.div
                          key={podcast.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * (index % 10) }}
                        >
                          <SoundscapeCard
                            className="cursor-pointer"
                            onClick={() => handleSelectPodcast(podcast)}
                          >
                            <div className="flex gap-4 p-3 items-center">
                              <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
                                <img
                                  src={podcast.thumbnail_url || "/podcast-placeholder.jpg"}
                                  alt={podcast.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/podcast-placeholder.jpg";
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white mb-1 truncate">{podcast.title}</h3>
                                <p className="text-sm text-purple-300/80 mb-1">{podcast.area}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{podcast.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {podcast.categories.slice(0, 2).map((category, i) => (
                                    <Badge key={i} variant="outline" className="bg-purple-900/30 text-xs">
                                      {category.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                                <span>{formatDate(podcast.published_at)}</span>
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {podcast.commentCount}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {podcast.likeCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </SoundscapeCard>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Podcasts;
