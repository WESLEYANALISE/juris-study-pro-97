
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, PlaySquare } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { 
  getJuridicPlaylists, 
  getPlaylistVideos, 
  type YouTubeVideo, 
  type YouTubePlaylist 
} from "@/lib/youtube-service";

// Mock das disciplinas e playlists (substituir pela API real do YouTube)
const disciplinas = [
  { id: "constitucional", nome: "Direito Constitucional" },
  { id: "administrativo", nome: "Direito Administrativo" },
  { id: "civil", nome: "Direito Civil" },
  { id: "penal", nome: "Direito Penal" },
  { id: "processual", nome: "Direito Processual" },
  { id: "trabalho", nome: "Direito do Trabalho" },
  { id: "tributario", nome: "Direito Tributário" },
  { id: "empresarial", nome: "Direito Empresarial" },
];

// Função para buscar playlists do YouTube
const fetchYouTubePlaylists = async (disciplina: string): Promise<YouTubePlaylist[]> => {
  // Tentando buscar playlists da API
  try {
    const playlists = await getJuridicPlaylists(disciplina);
    if (playlists.length > 0) {
      return playlists;
    }
  } catch (error) {
    console.error("Erro ao buscar playlists da API:", error);
  }
  
  // Fallback para dados simulados se a API falhar
  return Array(6).fill(null).map((_, index) => ({
    id: `playlist-${disciplina}-${index}`,
    title: `${disciplinas.find(d => d.id === disciplina)?.nome || disciplina} - Parte ${index + 1}`,
    description: `Playlist completa sobre tópicos importantes de ${disciplinas.find(d => d.id === disciplina)?.nome || disciplina}.`,
    thumbnail: `https://picsum.photos/seed/${disciplina}${index}/640/360`,
    videoCount: Math.floor(Math.random() * 20) + 5,
    channelTitle: "JurisStudy Pro"
  }));
};

// Função para buscar vídeos de uma playlist
const fetchPlaylistVideos = async (playlistId: string): Promise<YouTubeVideo[]> => {
  // Tentando buscar vídeos da API
  try {
    const videos = await getPlaylistVideos(playlistId);
    if (videos.length > 0) {
      return videos;
    }
  } catch (error) {
    console.error("Erro ao buscar vídeos da API:", error);
  }
  
  // Fallback para dados simulados se a API falhar
  return Array(8).fill(null).map((_, index) => ({
    id: `video-${playlistId}-${index}`,
    title: `Aula ${index + 1} - Tópico importante`,
    description: `Descrição detalhada da aula ${index + 1} sobre este tópico importante.`,
    thumbnail: `https://picsum.photos/seed/${playlistId}${index}/640/360`,
    publishedAt: new Date(Date.now() - (index * 86400000)).toISOString(),
    channelTitle: "JurisStudy Pro",
    duration: `${Math.floor(Math.random() * 40) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
  }));
};

// Componente principal de VideoAulas
const VideoAulas = () => {
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>("constitucional");
  const [playlistSelecionada, setPlaylistSelecionada] = useState<string | null>(null);
  const [videoSelecionado, setVideoSelecionado] = useState<YouTubeVideo | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Query para buscar playlists
  const { 
    data: playlists, 
    isLoading: isLoadingPlaylists 
  } = useQuery({
    queryKey: ['playlists', disciplinaSelecionada],
    queryFn: () => fetchYouTubePlaylists(disciplinaSelecionada),
  });

  // Query para buscar vídeos da playlist selecionada
  const { 
    data: videos, 
    isLoading: isLoadingVideos 
  } = useQuery({
    queryKey: ['videos', playlistSelecionada],
    queryFn: () => playlistSelecionada ? fetchPlaylistVideos(playlistSelecionada) : Promise.resolve([]),
    enabled: !!playlistSelecionada,
  });

  // Reset da paginação quando mudar de disciplina
  useEffect(() => {
    setPage(1);
    setPlaylistSelecionada(null);
    setVideoSelecionado(null);
  }, [disciplinaSelecionada]);

  // Resetar vídeo selecionado quando mudar de playlist
  useEffect(() => {
    setVideoSelecionado(null);
  }, [playlistSelecionada]);

  // Cálculos para paginação
  const totalPages = playlists ? Math.ceil(playlists.length / itemsPerPage) : 0;
  const paginatedPlaylists = playlists ? playlists.slice((page - 1) * itemsPerPage, page * itemsPerPage) : [];

  // Função para formatar data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Função para assistir vídeo
  const assistirVideo = (video: YouTubeVideo) => {
    setVideoSelecionado(video);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold">Vídeo-aulas</h1>
        <p className="text-muted-foreground">Assista às aulas das principais disciplinas jurídicas</p>
      </div>

      <Tabs defaultValue={disciplinaSelecionada} onValueChange={setDisciplinaSelecionada} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 animate-fade-in">
          {disciplinas.map((disciplina) => (
            <TabsTrigger key={disciplina.id} value={disciplina.id}>
              {disciplina.nome}
            </TabsTrigger>
          ))}
        </TabsList>

        {disciplinas.map((disciplina) => (
          <TabsContent key={disciplina.id} value={disciplina.id} className="pt-4">
            {playlistSelecionada ? (
              <div>
                <div className="flex justify-between items-center mb-6 animate-fade-in">
                  <Button variant="outline" onClick={() => setPlaylistSelecionada(null)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar para playlists
                  </Button>
                </div>
                
                {videoSelecionado ? (
                  <div className="animate-fade-in">
                    <VideoPlayer
                      video={videoSelecionado}
                      onClose={() => setVideoSelecionado(null)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoadingVideos ? (
                      Array(6).fill(null).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                          <Skeleton className="h-[180px] w-full" />
                          <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      videos?.map((video, index) => (
                        <Card 
                          key={video.id} 
                          className={`overflow-hidden shadow-md hover:shadow-card-hover transition-all duration-300 animate-fade-in border border-transparent hover:border-primary/30`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div 
                            className="relative cursor-pointer"
                            onClick={() => assistirVideo(video)}
                          >
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-[180px] object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-primary/80 hover:bg-primary">
                                <Play className="h-6 w-6 text-white" fill="white" />
                              </Button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                            <CardDescription>
                              {video.channelTitle} • {formatDate(video.publishedAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {video.description}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => assistirVideo(video)}
                            >
                              <PlaySquare className="h-4 w-4 mr-2" />
                              Assistir aula
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoadingPlaylists ? (
                    Array(6).fill(null).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <Skeleton className="h-[180px] w-full" />
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                      </Card>
                    ))
                  ) : (
                    paginatedPlaylists.map((playlist, index) => (
                      <Card 
                        key={playlist.id} 
                        className="overflow-hidden shadow-md hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-fade-in border border-transparent hover:border-primary/30"
                        onClick={() => setPlaylistSelecionada(playlist.id)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="relative">
                          <img 
                            src={playlist.thumbnail} 
                            alt={playlist.title}
                            className="w-full h-[180px] object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-primary/80 hover:bg-primary">
                              <Play className="h-6 w-6 text-white" fill="white" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <PlaySquare className="h-3 w-3" /> 
                            {playlist.videoCount} vídeos
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{playlist.title}</CardTitle>
                          <CardDescription>
                            {playlist.channelTitle}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {playlist.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            <PlaySquare className="h-4 w-4 mr-2" />
                            Ver playlist
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 gap-2 animate-fade-in">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoadingPlaylists}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoadingPlaylists}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default VideoAulas;
