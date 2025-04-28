
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SearchIcon, FileText, Video, BookOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { StoredPlaylist, getPlaylistVideos } from "@/lib/youtube-service";

interface Article {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  playlist_ids?: string[];
  created_at: string;
  updated_at: string;
}

interface EnhancedStoredPlaylist extends StoredPlaylist {
  is_single_video: boolean;
  video_id?: string;
}

export function ArtigosApoio() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [playlists, setPlaylists] = useState<EnhancedStoredPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data: articlesData, error: articlesError } = await supabase
        .from('redacao_artigos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (articlesError) {
        throw articlesError;
      }
      
      const articlesWithPlaylists = (articlesData || []).map(article => ({
        ...article,
        tags: article.tags || [],
        playlist_ids: article.playlist_ids || []
      })) as Article[];
      
      setArticles(articlesWithPlaylists);
      
      const uniqueCategories = Array.from(
        new Set((articlesWithPlaylists || []).map(article => article.categoria))
      );
      setCategories(uniqueCategories as string[]);
      
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('video_playlists_juridicas')
        .select('*')
        .ilike('area', 'Redação Jurídica%')
        .order('video_count', { ascending: false });
      
      if (playlistsError) {
        throw playlistsError;
      }
      
      const typedPlaylistsData = (playlistsData || []).map(playlist => ({
        ...playlist,
        is_single_video: Boolean(playlist.is_single_video),
        video_id: playlist.video_id || undefined
      })) as EnhancedStoredPlaylist[];
      
      setPlaylists(typedPlaylistsData);
      
    } catch (error) {
      console.error("Error loading articles:", error);
      toast.error("Erro ao carregar artigos. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article: Article) => {
    setSelectedArticle(article);
    setActiveTab("article-view");
    
    if (article.playlist_ids && article.playlist_ids.length > 0) {
      try {
        const { data, error } = await supabase
          .from('video_playlists_juridicas')
          .select('*')
          .in('playlist_id', article.playlist_ids);
        
        if (error) {
          throw error;
        }
        
        const typedPlaylistsData = (data || []).map(playlist => ({
          ...playlist,
          is_single_video: Boolean(playlist.is_single_video),
          video_id: playlist.video_id || undefined
        })) as EnhancedStoredPlaylist[];
        
        setPlaylists(typedPlaylistsData);
        
        const singleVideo = typedPlaylistsData.find(playlist => playlist.is_single_video);
        if (singleVideo && singleVideo.video_id) {
          setSelectedVideoId(singleVideo.video_id);
        }
        
      } catch (error) {
        console.error("Error loading associated playlists:", error);
      }
    }
  };

  const handlePlaylistClick = async (playlist: EnhancedStoredPlaylist) => {
    try {
      if (playlist.is_single_video && playlist.video_id) {
        setSelectedVideoId(playlist.video_id);
      } else {
        const videos = await getPlaylistVideos(playlist.playlist_id);
        
        if (videos && videos.length > 0) {
          setSelectedVideoId(videos[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Erro ao carregar vídeos. Por favor, tente novamente.");
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = !selectedCategory || article.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="articles">
            <FileText className="h-4 w-4 mr-2" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Vídeos
          </TabsTrigger>
          {selectedArticle && (
            <TabsTrigger value="article-view">
              <BookOpen className="h-4 w-4 mr-2" />
              Artigo Atual
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="articles" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Pesquisar por título ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="border rounded-md p-2"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">Todas as Categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2">{article.titulo}</CardTitle>
                    <CardDescription>
                      {article.categoria}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{article.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.conteudo.substring(0, 150)}...
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Ler mais
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível."}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Buscar vídeos por título ou canal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.filter(playlist => 
                !searchTerm || 
                playlist.playlist_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playlist.channel_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playlist.area.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(playlist => (
                <Card 
                  key={playlist.id} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={playlist.thumbnail_url || "/placeholder.svg"} 
                      alt={playlist.playlist_title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2">{playlist.playlist_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {playlist.channel_title}
                      {!playlist.is_single_video && (
                        <span> • {playlist.video_count} vídeos</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {playlist.area.replace('Redação Jurídica - ', '')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {playlists.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum vídeo disponível.</p>
              </div>
            )}
          </div>
          
          {selectedVideoId && (
            <Card className="mt-6">
              <CardContent className="p-4 space-y-4">
                <div className="aspect-video w-full">
                  <VideoPlayer videoId={selectedVideoId} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="article-view">
          {selectedArticle && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedArticle.titulo}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span>{selectedArticle.categoria}</span>
                        <span className="text-sm">
                          {new Date(selectedArticle.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedArticle.tags.map(tag => (
                            <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <ScrollArea className="max-h-[600px] pr-4">
                      <ReactMarkdown>{selectedArticle.conteudo}</ReactMarkdown>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("articles")}
                    >
                      Voltar para a lista
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vídeos relacionados</h3>
                
                {selectedVideoId && (
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <VideoPlayer videoId={selectedVideoId} />
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {playlists.filter(p => 
                    selectedArticle.playlist_ids?.includes(p.playlist_id)
                  ).map(playlist => (
                    <Card 
                      key={playlist.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        (playlist.is_single_video && playlist.video_id === selectedVideoId) ? 'border-primary' : ''
                      }`}
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="flex p-3 items-center gap-3">
                        <div className="w-16 h-12 overflow-hidden rounded">
                          <img 
                            src={playlist.thumbnail_url || "/placeholder.svg"}
                            alt={playlist.playlist_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{playlist.playlist_title}</h4>
                          <p className="text-xs text-muted-foreground">{playlist.channel_title}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {(!selectedArticle.playlist_ids || selectedArticle.playlist_ids.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum vídeo associado a este artigo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
