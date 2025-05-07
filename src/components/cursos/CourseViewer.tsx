
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookmarkPlus, Bookmark, MessageSquare, Download, Volume2, Volume1, VolumeX, X } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const localVideoRef = useRef<HTMLIFrameElement>(null);
  const actualVideoRef = videoRef || localVideoRef;
  const notesTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  
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

  // Hide navbar and footer when in full screen mode
  useEffect(() => {
    // Add a class to the body to hide navigation elements
    document.body.classList.add('viewing-course');
    
    // Cleanup
    return () => {
      document.body.classList.remove('viewing-course');
    };
  }, []);
  
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
  };
  
  const VolumeIcon = volume === "muted" ? VolumeX : volume === "low" ? Volume1 : Volume2;

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black z-50">
      {/* Floating close button in the top left */}
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack} 
          className="rounded-full shadow-lg backdrop-blur-sm bg-black/40 border-white/30"
        >
          <X className="h-5 w-5 text-white" />
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
          {youtubeId ? (
            <iframe
              ref={actualVideoRef}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
              className="w-full h-full border-0"
              title={title}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
            />
          ) : videoUrl ? (
            <iframe
              ref={actualVideoRef}
              src={videoUrl}
              className="w-full h-full border-0"
              title={title}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
              Vídeo não disponível
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden controls overlay triggered by button */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm transition-all z-30">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2 flex-wrap">
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
      <div className="absolute bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleControls}
          className="rounded-full shadow-lg bg-black/40 border-white/30"
        >
          {showControls ? <X className="h-5 w-5 text-white" /> : <ChevronLeft className="h-5 w-5 text-white" />}
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
