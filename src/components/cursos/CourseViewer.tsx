
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookmarkPlus, Bookmark, MessageSquare, Download, Volume2, Volume1, VolumeX, X, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";

interface CourseViewerProps {
  title: string;
  videoUrl: string;
  onBack: () => void;
  progress?: number;
  updateProgress?: (progress: number) => void;
  downloadUrl?: string | null;
  savedNotes?: string;
  onSaveNotes?: (notes: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  videoRef?: React.RefObject<HTMLIFrameElement>;
  initialShowNotes?: boolean;
  onNotesVisibilityChange?: (visible: boolean) => void;
}

export function CourseViewer({
  title,
  videoUrl,
  onBack,
  progress = 0,
  updateProgress,
  downloadUrl,
  savedNotes = "",
  onSaveNotes,
  isBookmarked = false,
  onToggleBookmark,
  videoRef,
  initialShowNotes = false,
  onNotesVisibilityChange
}: CourseViewerProps) {
  const [notes, setNotes] = useState(savedNotes);
  const [showNotes, setShowNotes] = useState(initialShowNotes);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState<"muted" | "low" | "normal">("normal");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLIFrameElement>(null);
  const actualVideoRef = videoRef || localVideoRef;
  const notesTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const webViewRef = useRef<HTMLDivElement>(null);
  
  // Determine content type based on URL
  const getContentType = (url: string) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('mindsmith.ai')) return 'mindsmith';
    return 'external';
  }
  
  const contentType = getContentType(videoUrl);
  
  useEffect(() => {
    // Hide mobile navigation when course is active
    document.body.classList.add('course-viewer-active');
    
    // If there's a valid URL and we're using a webview approach, update progress
    if (videoUrl && updateProgress) {
      // Simulate viewing progress since we can't track it directly in webview
      const initialProgress = progress > 10 ? progress : 10;
      updateProgress(initialProgress);
    }
    
    // Reset loading state whenever URL changes
    setLoading(true);
    setLoadError(null);
    
    // Set timeout to detect loading issues
    loadingTimeoutRef.current = window.setTimeout(() => {
      if (contentType !== 'youtube' && loading) {
        setLoading(false);
        if (videoUrl) {
          setLoadError('O conteúdo está demorando para carregar. Você pode tentar abrir em uma nova aba.');
        } else {
          setLoadError('Não foi possível carregar o conteúdo do curso.');
        }
      }
    }, 10000); // 10 second timeout
    
    return () => {
      document.body.classList.remove('course-viewer-active');
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [videoUrl, updateProgress, progress, contentType, loading]);
  
  // Handle initial notes panel visibility
  useEffect(() => {
    setShowNotes(initialShowNotes);
  }, [initialShowNotes]);
  
  // Notify parent of notes visibility changes
  useEffect(() => {
    if (onNotesVisibilityChange) {
      onNotesVisibilityChange(showNotes);
    }
  }, [showNotes, onNotesVisibilityChange]);
  
  // Track progress simulation
  useEffect(() => {
    if (!updateProgress) return;
    
    progressIntervalRef.current = window.setInterval(() => {
      // Simulate progress update - in a real app this would come from the video player API
      if (progress < 100) {
        updateProgress(Math.min(progress + 5, 100));
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 30000); // Update every 30 seconds
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [progress, updateProgress]);

  // Handle notes autosave with cleanup
  useEffect(() => {
    if (notes !== savedNotes && onSaveNotes) {
      if (notesTimeoutRef.current !== null) {
        clearTimeout(notesTimeoutRef.current);
      }
      
      notesTimeoutRef.current = window.setTimeout(() => {
        onSaveNotes(notes);
        notesTimeoutRef.current = null;
      }, 1000);
    }
    
    return () => {
      if (notesTimeoutRef.current !== null) {
        clearTimeout(notesTimeoutRef.current);
        notesTimeoutRef.current = null;
      }
    };
  }, [notes, savedNotes, onSaveNotes]);
  
  // Extract YouTube video ID from URL if it's a YouTube link
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };
  
  const youtubeId = videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) 
    ? getYoutubeId(videoUrl) 
    : null;

  const cycleVolume = () => {
    const volumes: Array<"muted" | "low" | "normal"> = ["normal", "low", "muted"];
    const currentIndex = volumes.findIndex(v => v === volume);
    const nextIndex = (currentIndex + 1) % volumes.length;
    setVolume(volumes[nextIndex]);
    
    toast(`Volume alterado para ${volumes[nextIndex]}`, {
      description: "Esta configuração afeta apenas o elemento de interface e não o volume real do vídeo."
    });
  };
  
  const VolumeIcon = volume === "muted" ? VolumeX : volume === "low" ? Volume1 : Volume2;

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleOpenExternalLink = () => {
    try {
      // Try to open the URL in a new window
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
      
      // Update progress to indicate the user accessed the course
      if (updateProgress) {
        updateProgress(Math.max(progress, 10));
        toast.success("Conteúdo aberto em uma nova aba");
      }
    } catch (error) {
      console.error("Erro ao abrir o link:", error);
      toast.error("Não foi possível abrir o link. Verifique se os pop-ups estão permitidos.");
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Update progress when content is loaded
    if (updateProgress) {
      updateProgress(Math.max(progress, 15));
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setLoadError('Não foi possível carregar o conteúdo no player interno. Por favor, tente abrir em uma nova aba.');
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const renderCourseContent = () => {
    if (!videoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <p className="text-xl mb-2">Vídeo não disponível</p>
            <p className="text-sm text-gray-400">O link para este curso não foi encontrado.</p>
          </div>
        </div>
      );
    }

    // For YouTube videos, use iframe with embed
    if (youtubeId) {
      return (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <LoadingState 
                variant="spinner" 
                message="Carregando vídeo..." 
                className="text-white" 
              />
            </div>
          )}
          
          <iframe
            ref={actualVideoRef}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            className="w-full h-full border-0"
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="eager"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </>
      );
    }
    
    // For all other links (including Mindsmith), use webview approach
    return (
      <div className="w-full h-full flex flex-col">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <LoadingState 
              variant="spinner" 
              message={contentType === 'mindsmith' ? 'Carregando conteúdo do Mindsmith...' : 'Carregando conteúdo...'} 
              className="text-white" 
            />
          </div>
        )}
        
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="max-w-md p-6 rounded-lg bg-background">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleOpenExternalLink} 
                className="flex items-center gap-2 w-full"
                variant="default"
                size="lg"
              >
                <ExternalLink className="h-5 w-5" />
                Abrir em Nova Aba
              </Button>
            </div>
          </div>
        )}
        
        <div 
          ref={webViewRef}
          className="w-full h-full bg-white"
        >
          <iframe
            src={videoUrl}
            className="w-full h-full border-0"
            title={title}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            loading="eager"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
        
        <div className="absolute bottom-16 left-0 right-0 flex justify-center">
          <Button 
            onClick={handleOpenExternalLink} 
            className="flex items-center gap-2 bg-primary shadow-lg"
            size="lg"
          >
            <ExternalLink className="h-5 w-5" />
            Abrir em Nova Aba
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black z-[100]">
      {/* Close button in the top right corner as requested */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={onBack} 
          className="shadow-lg"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {updateProgress !== undefined && progress > 0 && (
        <div className="absolute top-0 left-0 right-0 z-40">
          <Progress value={progress} className="h-1 bg-black/30" />
        </div>
      )}
      
      {/* Full screen video container */}
      <div className="flex-grow w-full h-full overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {renderCourseContent()}
        </div>
      </div>
      
      {/* Hidden controls overlay triggered by button */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm transition-all z-30">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                onClick={() => {
                  setShowNotes(!showNotes);
                  if (showNotes) setShowControls(false);
                }}
                className="flex items-center bg-black/40 text-white border-white/30"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>
                  {showNotes ? "Ocultar notas" : "Mostrar notas"}
                </span>
              </Button>
              
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    className="flex items-center bg-black/40 text-white border-white/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Material de apoio</span>
                  </Button>
                </a>
              )}
              
              {onToggleBookmark && (
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  onClick={onToggleBookmark}
                  title={isBookmarked ? "Remover marcador" : "Adicionar marcador"}
                  className="bg-black/40 text-white border-white/30"
                >
                  {isBookmarked ? (
                    <Bookmark className="h-4 w-4 mr-2 fill-current" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                  )}
                  <span>{isBookmarked ? "Remover marcador" : "Adicionar marcador"}</span>
                </Button>
              )}
              
              {youtubeId && (
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  onClick={cycleVolume}
                  title={`Volume: ${volume}`}
                  className="bg-black/40 text-white border-white/30"
                >
                  <VolumeIcon className="h-4 w-4 mr-2" />
                  <span>
                    {volume === "normal" ? "Volume normal" : volume === "low" ? "Volume baixo" : "Mudo"}
                  </span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                onClick={handleOpenExternalLink}
                className="flex items-center bg-black/40 text-white border-white/30"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span>Abrir em nova aba</span>
              </Button>
            </div>
            
            {updateProgress !== undefined && (
              <div className="text-sm text-white/70">
                {progress >= 100 
                  ? "Curso concluído" 
                  : `Progresso: ${progress}%`
                }
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toggle controls button */}
      <div className="absolute bottom-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleControls}
          className="rounded-full shadow-lg bg-black/40 border-white/30"
        >
          {showControls ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <Sheet open={showNotes} onOpenChange={setShowNotes}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Minhas anotações</SheetTitle>
            <SheetDescription>
              Faça suas anotações sobre este curso. Elas serão salvas automaticamente.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Textarea
              className="min-h-[300px] resize-none bg-background border-input"
              placeholder="Digite suas anotações sobre este curso..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
