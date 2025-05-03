
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  BookmarkPlus, Bookmark, Copy, Heart, Share2, Save, 
  Settings, Menu, ChevronUp, ChevronDown, Clock, Maximize,
  Minimize, PlusCircle, Download, X, MessageSquare, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface PodcastTimestamp {
  id: string;
  time: number;
  label: string;
  notes?: string;
  color?: string;
}

interface AdvancedPodcastPlayerProps {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
  duration?: number;
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
  categories?: { name: string; slug: string; }[];
}

export function AdvancedPodcastPlayer({
  id,
  title,
  description,
  audioUrl,
  imageUrl,
  author = 'Autor desconhecido',
  publishedAt,
  duration = 0,
  onClose,
  isMinimized = false,
  onMinimizeToggle,
  categories = []
}: AdvancedPodcastPlayerProps) {
  // Audio control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // UI state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [showTimestampDialog, setShowTimestampDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [timestampLabel, setTimestampLabel] = useState('');
  const [timestampNotes, setTimestampNotes] = useState('');
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [userSeekTime, setUserSeekTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Audio features
  const [timestamps, setTimestamps] = useState<PodcastTimestamp[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [listens, setListens] = useState(Math.floor(Math.random() * 1000) + 100);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 10);

  // Auth
  const { user } = useAuth();

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Mock transcript data
  const mockTranscript = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl eget rhoncus ultricies, nisl nisl aliquet nisl, eget aliquet nisl nisl eget nisl. Nulla facilisi. Nullam euismod, nisl eget rhoncus ultricies, nisl nisl aliquet nisl, eget aliquet nisl nisl eget nisl.\n\nNulla facilisi. Nullam euismod, nisl eget rhoncus ultricies, nisl nisl aliquet nisl, eget aliquet nisl nisl eget nisl. Proin euismod, nisl eget rhoncus ultricies, nisl nisl aliquet nisl, eget aliquet nisl nisl eget nisl. Nulla facilisi.";
  
  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: '1',
      userName: 'Carolina Mendes',
      userAvatar: 'https://i.pravatar.cc/150?img=24',
      text: 'Excelente podcast! Adorei a parte sobre os novos precedentes do STJ.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      likes: 5
    },
    {
      id: '2',
      userName: 'André Silveira',
      userAvatar: 'https://i.pravatar.cc/150?img=67',
      text: 'Alguém sabe onde posso encontrar a jurisprudência mencionada aos 15 minutos?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      likes: 2
    }
  ]);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      if (!isUserSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const loadedPercentage = (audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100;
        setLoadProgress(loadedPercentage);
      }
    };
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('progress', handleProgress);
    audio.volume = volume;
    
    // Initialize audio visualization
    if (window.AudioContext) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      analyserRef.current.fftSize = 256;
    }
    
    return () => {
      audio.pause();
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('progress', handleProgress);
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);
  
  // Draw audio visualization
  const drawVisualization = useCallback(() => {
    if (!visualizerRef.current || !analyserRef.current || !isPlaying) return;
    
    const canvas = visualizerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!visualizerRef.current || !analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(159, 122, 234, 0.8)');
        gradient.addColorStop(1, 'rgba(112, 72, 232, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);
  
  // Handle visualization effect
  useEffect(() => {
    if (showVisualization && isPlaying) {
      drawVisualization();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [showVisualization, isPlaying, drawVisualization]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Resume AudioContext if suspended (browser policy)
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Erro ao reproduzir áudio",
          description: "Verifique sua conexão com a internet."
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);
  
  // Handle playback rate change
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);
  
  // Format time helper function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    setUserSeekTime(value[0]);
    setIsUserSeeking(true);
  };
  
  const handleSeekCommit = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = userSeekTime;
    setCurrentTime(userSeekTime);
    setIsUserSeeking(false);
  };
  
  // Skip functions
  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 10;
    setCurrentTime(audioRef.current.currentTime);
  };
  
  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 10;
    setCurrentTime(audioRef.current.currentTime);
  };
  
  // Handle timestamp creation
  const handleAddTimestamp = () => {
    if (!timestampLabel.trim()) return;
    
    const newTimestamp: PodcastTimestamp = {
      id: Date.now().toString(),
      time: currentTime,
      label: timestampLabel,
      notes: timestampNotes,
      color: getRandomColor()
    };
    
    setTimestamps(prev => [...prev, newTimestamp]);
    setTimestampLabel('');
    setTimestampNotes('');
    setShowTimestampDialog(false);
    
    toast("Marcador adicionado com sucesso!");
  };
  
  // Jump to timestamp
  const jumpToTimestamp = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  // Toggle favorite
  const handleToggleFavorite = () => {
    setIsFavorite(prev => !prev);
    toast(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    
    if (!isFavorite) {
      setLikes(prev => prev + 1);
    } else {
      setLikes(prev => prev - 1);
    }
  };
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };
  
  // Fullscreen change event listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  // Add a comment
  const handleAddComment = () => {
    if (!commentText.trim() || !user) {
      toast("Por favor, digite um comentário e faça login para continuar");
      return;
    }
    
    const newComment = {
      id: Date.now().toString(),
      userName: user.email?.split('@')[0] || 'Usuário',
      userAvatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      text: commentText,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast("Comentário adicionado com sucesso!");
  };
  
  // Share podcast
  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Ouça "${title}" em ${url}`)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ouça "${title}" em ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => toast("Link copiado para a área de transferência"))
          .catch(() => toast("Erro ao copiar link"));
        setShareDialogOpen(false);
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    setShareDialogOpen(false);
  };
  
  // Download podcast
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Download iniciado!");
  };
  
  // Helper function for random colors
  const getRandomColor = () => {
    const colors = ['#E0F7FA', '#F3E5F5', '#FFF3E0', '#E8F5E9', '#FFF9C4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Render timestamp markers on the progress bar
  const renderTimestampMarkers = () => {
    return timestamps.map(timestamp => {
      const position = (timestamp.time / audioDuration) * 100;
      return (
        <div
          key={timestamp.id}
          className="absolute bottom-full mb-1 transform -translate-x-1/2 cursor-pointer"
          style={{ left: `${position}%` }}
          title={timestamp.label}
          onClick={() => jumpToTimestamp(timestamp.time)}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: timestamp.color || '#FFD600' }}
          />
        </div>
      );
    });
  };
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  // Render minimized player
  if (isMinimized) {
    return (
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <div className="truncate">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground truncate">{author}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMinimizeToggle}>
            <ChevronUp className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-background flex flex-col",
        isFullScreen ? "h-screen" : "rounded-lg border shadow-lg max-w-3xl w-full mx-auto"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg truncate">{title}</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onMinimizeToggle}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left side - Cover image and visualization */}
        <div className="w-full md:w-1/2 relative">
          {showVisualization && isPlaying ? (
            <div className="w-full aspect-square bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
              <canvas 
                ref={visualizerRef}
                width={300}
                height={300}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-muted relative overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Podcast';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                  <h2 className="text-3xl font-bold text-white">{title.charAt(0)}</h2>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="text-white">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-sm opacity-90">{author}</p>
                  {publishedAt && (
                    <p className="text-xs opacity-70">{formatDate(publishedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Stats and actions bar */}
          <div className="p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleToggleFavorite}
                className={cn(
                  "flex items-center gap-1 text-sm",
                  isFavorite ? "text-red-500" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500")} />
                <span>{likes}</span>
              </button>
              
              <button 
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                className={cn(
                  "flex items-center gap-1 text-sm",
                  showCommentsPanel ? "text-primary" : "text-muted-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShareDialogOpen(true)} 
                className="text-xs flex gap-1"
              >
                <Share2 className="w-3 h-3" />
                Compartilhar
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownload} 
                className="text-xs flex gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Description */}
          {description && (
            <div className="p-4 text-sm overflow-y-auto max-h-32 md:max-h-none">
              <p className="text-muted-foreground">{description}</p>
              
              {categories && categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <Badge key={cat.slug} variant="outline" className="text-xs">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right side - Transcript, comments, or timestamps */}
        <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l flex flex-col">
          <div className="border-b p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Conteúdo do podcast</h4>
              <Button variant="outline" size="sm" onClick={() => setShowVisualization(!showVisualization)}>
                {showVisualization ? "Esconder visualização" : "Mostrar visualização"}
              </Button>
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant={!showTranscript && !showCommentsPanel ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowTranscript(false);
                  setShowCommentsPanel(false);
                }}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                Marcadores
              </Button>
              
              <Button 
                variant={showTranscript ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowTranscript(!showTranscript);
                  setShowCommentsPanel(false);
                }}
              >
                <Menu className="w-4 h-4 mr-1" />
                Transcrição
              </Button>
              
              <Button 
                variant={showCommentsPanel ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowCommentsPanel(!showCommentsPanel);
                  setShowTranscript(false);
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Comentários
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 overflow-y-auto">
            {/* Timestamps view */}
            {!showTranscript && !showCommentsPanel && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Seus marcadores</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowTimestampDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Novo marcador
                  </Button>
                </div>
                
                {timestamps.length > 0 ? (
                  <div className="space-y-3">
                    {timestamps.map(timestamp => (
                      <div 
                        key={timestamp.id}
                        className="p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors"
                        style={{ borderLeft: `4px solid ${timestamp.color}` }}
                        onClick={() => jumpToTimestamp(timestamp.time)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{timestamp.label}</span>
                          <span className="text-sm text-muted-foreground">{formatTime(timestamp.time)}</span>
                        </div>
                        {timestamp.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{timestamp.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum marcador adicionado</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowTimestampDialog(true)}
                      className="mt-2"
                    >
                      Adicionar marcador neste ponto
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Transcript view */}
            {showTranscript && (
              <div className="p-4">
                <h4 className="font-medium mb-3">Transcrição</h4>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {mockTranscript}
                </p>
              </div>
            )}
            
            {/* Comments view */}
            {showCommentsPanel && (
              <div className="p-4">
                <h4 className="font-medium mb-3">Comentários</h4>
                
                {/* Comment input */}
                {user ? (
                  <div className="mb-4 space-y-2">
                    <Textarea 
                      placeholder="Adicione um comentário..." 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full h-20 resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-muted/50 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">
                      Faça login para deixar um comentário
                    </p>
                  </div>
                )}
                
                {/* Comments list */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-3 p-3 border-b">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={comment.userAvatar} 
                            alt={comment.userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.text}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="text-xs text-muted-foreground flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{comment.likes}</span>
                            </button>
                            <button className="text-xs text-muted-foreground">
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">Seja o primeiro a comentar</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      
      {/* Player controls */}
      <div className="border-t p-4 bg-background sticky bottom-0">
        {/* Progress bar with timestamp markers */}
        <div className="relative mb-2">
          {renderTimestampMarkers()}
          
          <div className="h-1 w-full bg-muted relative rounded-full overflow-hidden">
            <div 
              className="h-full bg-muted-foreground rounded-full absolute left-0 top-0 opacity-30"
              style={{ width: `${loadProgress}%` }}
            />
            <div 
              className="h-full bg-primary rounded-full absolute left-0 top-0"
              style={{ width: `${isUserSeeking ? (userSeekTime / audioDuration * 100) : (currentTime / audioDuration * 100)}%` }}
            />
          </div>
          
          <Slider 
            min={0}
            max={audioDuration}
            step={1}
            value={[isUserSeeking ? userSeekTime : currentTime]}
            onValueChange={handleSeek}
            onValueCommit={handleSeekCommit}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(isUserSeeking ? userSeekTime : currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between mt-2">
          {/* Left side - Playback speed */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSpeedControls(!showSpeedControls)}
              className="text-xs"
            >
              {playbackRate}x
            </Button>
            
            {showSpeedControls && (
              <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-md shadow-lg p-2 z-10">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    className={`block px-3 py-1 text-sm rounded hover:bg-muted w-full text-left ${playbackRate === rate ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedControls(false);
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Center - Main controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={skipBackward}
              className="rounded-full"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={togglePlayPause}
              variant="default" 
              size="icon" 
              className="rounded-full w-12 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-1" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={skipForward}
              className="rounded-full"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Right side - Volume */}
          <div className="flex items-center">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div 
                className="hidden group-hover:block lg:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border rounded-md p-2 shadow-lg z-10"
                style={{ width: '120px' }}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[isMuted ? 0 : volume]}
                  onValueChange={(vals) => {
                    setVolume(vals[0]);
                    if (vals[0] > 0 && isMuted) {
                      setIsMuted(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timestamp Dialog */}
      <Dialog open={showTimestampDialog} onOpenChange={setShowTimestampDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Marcador</DialogTitle>
            <DialogDescription>
              Crie um marcador neste ponto ({formatTime(currentTime)}) do podcast.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do marcador</label>
              <Input
                placeholder="Ex: Discussão sobre jurisprudência"
                value={timestampLabel}
                onChange={(e) => setTimestampLabel(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Textarea
                placeholder="Adicione notas sobre este trecho..."
                value={timestampNotes}
                onChange={(e) => setTimestampNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimestampDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTimestamp} disabled={!timestampLabel.trim()}>
              Salvar Marcador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Podcast</DialogTitle>
            <DialogDescription>
              Escolha como compartilhar "{title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20" 
              onClick={() => handleShare('whatsapp')}
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-1">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">WhatsApp</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare('twitter')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center mb-1">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Twitter</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare('facebook')} 
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-1">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Facebook</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare('copy')} 
            >
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center mb-1">
                <Copy className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Copiar Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
