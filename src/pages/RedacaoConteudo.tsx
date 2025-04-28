
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bookmark, Share2, BookOpen, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StoredPlaylist, getPlaylistVideos } from "@/lib/youtube-service";

interface Article {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  playlist_ids?: string[];
  created_at: string;
  updated_at: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
}

export default function RedacaoConteudo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<StoredPlaylist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("article");

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    setLoading(true);
    try {
      const { data: articleData, error: articleError } = await supabase
        .from('redacao_artigos')
        .select('*')
        .eq('id', articleId)
        .single();
      
      if (articleError) {
        throw articleError;
      }
      
      if (!articleData) {
        navigate('/redacao-juridica');
        return;
      }
      
      // Ensure article has the playlist_ids property, defaulting to empty array
      const articleWithPlaylists = {
        ...articleData,
        playlist_ids: articleData.playlist_ids || []
      };
      
      setArticle(articleWithPlaylists);
      
      // Check if article has playlist_ids and if they exist
      if (articleWithPlaylists.playlist_ids && articleWithPlaylists.playlist_ids.length > 0) {
        const { data: playlistsData, error: playlistsError } = await supabase
          .from('video_playlists_juridicas')
          .select('*')
          .in('playlist_id', articleWithPlaylists.playlist_ids);
        
        if (playlistsError) {
          throw playlistsError;
        }
        
        // Cast the data to include the optional properties that might be missing
        const typedPlaylistsData = (playlistsData || []).map(playlist => ({
          ...playlist,
          is_single_video: playlist.is_single_video || false,
          video_id: playlist.video_id || undefined
        })) as StoredPlaylist[];
        
        setPlaylists(typedPlaylistsData);
        
        const singleVideo = typedPlaylistsData.find(playlist => playlist.is_single_video);
        if (singleVideo) {
          setSelectedPlaylist(singleVideo);
          if (singleVideo.is_single_video && singleVideo.video_id) {
            setSelectedVideoId(singleVideo.video_id);
          }
        } else if (typedPlaylistsData && typedPlaylistsData.length > 0) {
          setSelectedPlaylist(typedPlaylistsData[0]);
          loadVideosFromPlaylist(typedPlaylistsData[0]);
        }
      }
      
    } catch (error) {
      console.error("Error loading article:", error);
      toast.error("Erro ao carregar o artigo.");
      navigate('/redacao-juridica');
    } finally {
      setLoading(false);
    }
  };

  const loadVideosFromPlaylist = async (playlist: StoredPlaylist) => {
    if (playlist.is_single_video && playlist.video_id) {
      setSelectedVideoId(playlist.video_id);
      return;
    }
    
    setLoading(true);
    try {
      const videosData = await getPlaylistVideos(playlist.playlist_id);
      
      setVideos(videosData);
      if (videosData && videosData.length > 0) {
        setSelectedVideoId(videosData[0].id);
      }
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Erro ao carregar vídeos da playlist.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlist: StoredPlaylist) => {
    setSelectedPlaylist(playlist);
    loadVideosFromPlaylist(playlist);
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    setActiveTab("video");
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </PageTransition>
    );
  }

  if (!article) {
    navigate('/redacao-juridica');
    return null;
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/redacao-juridica')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Redação Jurídica
          </Button>
          
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{article.titulo}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  {article.categoria}
                </span>
                {article.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="article">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Artigo
                </TabsTrigger>
                <TabsTrigger value="video" disabled={!selectedVideoId}>
                  <Video className="mr-2 h-4 w-4" />
                  Vídeo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="article">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown>{article.conteudo}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="video">
                {selectedVideoId ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="aspect-video w-full">
                        <VideoPlayer videoId={selectedVideoId} />
                      </div>
                      
                      <div className="mt-4">
                        {videos.find(v => v.id === selectedVideoId) && (
                          <>
                            <h3 className="text-xl font-semibold">
                              {videos.find(v => v.id === selectedVideoId)?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {videos.find(v => v.id === selectedVideoId)?.channelTitle}
                            </p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Selecione um vídeo para assistir.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4">Materiais de Vídeo</h3>
                
                {playlists.length > 0 ? (
                  <div className="space-y-4">
                    {playlists.map(playlist => (
                      <div 
                        key={playlist.id}
                        className={`border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                          selectedPlaylist?.id === playlist.id ? 'border-primary bg-accent' : ''
                        }`}
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-12 overflow-hidden rounded">
                            <img 
                              src={playlist.thumbnail_url || "/placeholder.svg"}
                              alt={playlist.playlist_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{playlist.playlist_title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {playlist.channel_title}
                              {!playlist.is_single_video && (
                                <span> • {playlist.video_count} vídeos</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum vídeo disponível para este artigo.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {selectedPlaylist && !selectedPlaylist.is_single_video && videos.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Vídeos na Playlist</h3>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {videos.map(video => (
                      <div 
                        key={video.id}
                        className={`border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${
                          selectedVideoId === video.id ? 'border-primary bg-accent' : ''
                        }`}
                        onClick={() => handleVideoSelect(video.id)}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-12 overflow-hidden rounded relative">
                            <img 
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 rounded-sm">
                              {video.duration}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {video.channelTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
