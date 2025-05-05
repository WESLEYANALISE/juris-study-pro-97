import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Bookmark, MessageSquare, Share2, X, ChevronDown, Heart, Clock, AudioWaveform } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SoundscapeVisualization, SoundscapeTimeline } from '@/components/ui/soundscape-theme';
import { formatTime } from '@/lib/format';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
interface ImmersivePodcastPlayerProps {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnail: string;
  author?: string;
  publishedAt?: string;
  categories?: {
    name: string;
    slug: string;
  }[];
  onClose: () => void;
}
export function ImmersivePodcastPlayer({
  id,
  title,
  description,
  audioUrl,
  thumbnail,
  author = "Autor desconhecido",
  publishedAt,
  categories = [],
  onClose
}: ImmersivePodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullView, setIsFullView] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('visualizer');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    text: string;
    timestamp: number;
    timeFormatted: string;
    date: string;
  }[]>([]);
  const {
    user
  } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Load comments (mock data)
  useEffect(() => {
    // Simulate fetched comments
    const mockComments = [{
      id: '1',
      user: {
        name: 'Ana Silva',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      text: 'Excelente episódio! Ajudou muito no meu estudo para a OAB.',
      timestamp: 125,
      timeFormatted: '02:05',
      date: '2 dias atrás'
    }, {
      id: '2',
      user: {
        name: 'Paulo Mendes',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      text: 'Esse ponto aos 5:30 foi muito esclarecedor!',
      timestamp: 330,
      timeFormatted: '05:30',
      date: '3 dias atrás'
    }];
    setComments(mockComments);
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Play/pause logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        toast.error('Erro ao reproduzir o áudio. Tente novamente.');
      });

      // Update progress smoothly with an interval
      if (!progressIntervalRef.current) {
        progressIntervalRef.current = setInterval(() => {
          setCurrentTime(audio.currentTime);
        }, 100);
      }
    } else {
      audio.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.volume = 0;
    } else {
      audio.volume = volume;
    }
  }, [volume, muted]);

  // Playback rate control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
    setCurrentTime(audio.currentTime);
  };
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    setCurrentTime(audio.currentTime);
  };
  const toggleMute = () => {
    setMuted(!muted);
  };
  const toggleFullView = () => {
    setIsFullView(!isFullView);
  };
  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success('Podcast adicionado aos favoritos');
    }
  };
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success('Marcador adicionado ao podcast');
    }
  };
  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    const newComment = {
      id: Date.now().toString(),
      user: {
        name: user.email?.split('@')[0] || 'Usuário',
        avatar: undefined
      },
      text: commentText,
      timestamp: currentTime,
      timeFormatted: formatTime(currentTime),
      date: 'agora'
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success('Comentário adicionado');
  };
  const jumpToCommentTime = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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

  // Generate visualization color based on title
  const getColorFromTitle = (title: string) => {
    // Simple hash function
    const hash = Array.from(title).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);

    // Convert hash to RGB color
    const r = Math.abs(hash % 255);
    const g = Math.abs(hash * 13 % 255);
    const b = Math.abs(hash * 23 % 255);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  };
  const visualizationColor = getColorFromTitle(title);
  return <motion.div ref={playerContainerRef} className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-purple-950 to-black overflow-hidden" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      {/* Header */}
      <motion.header className="p-4 flex items-center justify-between border-b border-white/10" initial={{
      y: -50,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.2
    }}>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 mx-4 text-center">
          <h1 className="text-lg font-medium truncate">{title}</h1>
          <p className="text-xs text-muted-foreground truncate">
            {author} • {formatDate(publishedAt)}
          </p>
        </div>
        
        <Button variant="ghost" size="icon" onClick={toggleFullView}>
          <ChevronDown className="h-5 w-5" />
        </Button>
      </motion.header>
      
      {/* Main content */}
      <motion.div className="flex-1 overflow-hidden" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.3
    }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full my-0 mx-[15px]">
          <TabsList className="mx-auto w-auto mt-2 bg-white/10 border border-white/5">
            <TabsTrigger value="visualizer" className="data-[state=active]:bg-purple-800/50">Visualização</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-purple-800/50">Detalhes</TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-purple-800/50">Comentários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualizer" className="p-4 h-full flex items-center justify-center overflow-hidden py-[17px] px-[15px] my-0 mx-[16px]">
            <motion.div className="w-full max-w-lg" initial={{
            scale: 0.9,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            type: "spring",
            stiffness: 200,
            damping: 20
          }}>
              {/* Podcast Cover */}
              <div className="relative mx-auto rounded-lg overflow-hidden aspect-square max-w-xs mb-6">
                <img src={thumbnail || "/placeholder-podcast.jpg"} alt={title} className="w-full h-full object-cover" onError={e => {
                (e.target as HTMLImageElement).src = "/placeholder-podcast.jpg";
              }} />
                
                <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-transparent to-black/40 flex items-center justify-center px-0 mx-0 my-0">
                  <AnimatePresence mode="wait">
                    {isPlaying ? <motion.div key="visualizer" initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} exit={{
                    opacity: 0
                  }} className="w-full h-full">
                        <SoundscapeVisualization isPlaying={isPlaying} color={visualizationColor} className="absolute inset-0 flex items-center justify-center" />
                      </motion.div> : <motion.div key="play-button" initial={{
                    scale: 0.8,
                    opacity: 0
                  }} animate={{
                    scale: 1,
                    opacity: 1
                  }} exit={{
                    scale: 0.8,
                    opacity: 0
                  }} className="rounded-full bg-purple-600/80 p-4 hover:bg-purple-500/80 cursor-pointer" onClick={togglePlayPause}>
                        <Play className="h-16 w-16 text-white" fill="white" />
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Waveform/Timeline */}
              <SoundscapeTimeline progress={duration > 0 ? currentTime / duration : 0} onSeek={handleSeek} className="w-full mb-4" />
              
              {/* Time display */}
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" onClick={skipBackward}>
                  <SkipBack className="h-6 w-6" />
                </Button>
                
                <Button size="icon" className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-500" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" fill="white" />}
                </Button>
                
                <Button variant="ghost" size="icon" onClick={skipForward}>
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Additional controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <Slider value={[muted ? 0 : volume * 100]} max={100} step={1} className="w-24" onValueChange={value => {
                  setVolume(value[0] / 100);
                  if (muted && value[0] > 0) {
                    setMuted(false);
                  }
                }} />
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant={isLiked ? "default" : "ghost"} size="sm" className={isLiked ? "bg-purple-600" : ""} onClick={toggleLike}>
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Button variant={isBookmarked ? "default" : "ghost"} size="sm" className={isBookmarked ? "bg-purple-600" : ""} onClick={toggleBookmark}>
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('comments')}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="info" className="p-4 overflow-auto h-full">
            <div className="max-w-lg mx-auto">
              <div className="flex items-start space-x-4 mb-6">
                <img src={thumbnail || "/placeholder-podcast.jpg"} alt={title} className="w-24 h-24 object-cover rounded-lg" onError={e => {
                (e.target as HTMLImageElement).src = "/placeholder-podcast.jpg";
              }} />
                
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{author}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(publishedAt)} • {formatTime(duration)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category, index) => <Badge key={index} variant="outline" className="bg-purple-900/40">
                        {category.name}
                      </Badge>)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {description || "Sem descrição disponível para este podcast."}
                </p>
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-2">Transcrição</h3>
                  <p className="text-sm text-muted-foreground">
                    A transcrição deste episódio estará disponível em breve.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="p-4 overflow-auto h-full">
            <div className="max-w-lg mx-auto">
              {user ? <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Adicionar comentário</h3>
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(currentTime)}
                        </span>
                      </div>
                      
                      <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Compartilhe seus pensamentos sobre este momento do podcast..." className="w-full p-2 rounded-md text-sm bg-white/5 border border-white/10" rows={3} />
                      
                      <Button onClick={handleAddComment} className="bg-purple-600 hover:bg-purple-500">
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div> : <div className="mb-6 p-4 text-center border border-white/10 rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-400/50" />
                  <p className="text-sm text-muted-foreground">
                    Faça login para deixar comentários
                  </p>
                </div>}
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Comentários ({comments.length})</h3>
                
                {comments.map(comment => <div key={comment.id} className="border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>{comment.user.name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{comment.user.name}</p>
                          <p className="text-xs text-muted-foreground">{comment.date}</p>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" onClick={() => jumpToCommentTime(comment.timestamp)} className="space-x-1">
                        <AudioWaveform className="h-3 w-3" />
                        <span>{comment.timeFormatted}</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm">{comment.text}</p>
                  </div>)}
                
                {comments.length === 0 && <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Ainda não há comentários para este podcast
                    </p>
                  </div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Footer playback controls (mini player) */}
      <motion.div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-md" initial={{
      y: 50,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.4
    }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPlaybackRate(prev => {
            const rates = [0.5, 1, 1.5, 2];
            const currentIndex = rates.indexOf(prev);
            return rates[(currentIndex + 1) % rates.length];
          })}>
              {playbackRate}x
            </Button>
            
            <div className="text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button size="icon" className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-500" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="white" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>;
}