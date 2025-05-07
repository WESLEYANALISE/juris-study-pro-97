
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

  // Enhanced notes functionality with sidebar for desktop and bottom sheet for mobile
  const toggleNotes = () => {
    setShowNotes(!showNotes);
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
      
      {/* Floating controls in bottom right */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleNotes} 
          className={`rounded-full shadow-lg backdrop-blur-sm ${showNotes ? 'bg-primary/40 border-primary' : 'bg-black/40 border-white/30'}`}
        >
          <MessageSquare className="h-5 w-5 text-white" />
        </Button>
        
        {downloadUrl && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => window.open(downloadUrl, '_blank')} 
            className="rounded-full shadow-lg backdrop-blur-sm bg-black/40 border-white/30"
          >
            <Download className="h-5 w-5 text-white" />
          </Button>
        )}
        
        {onToggleBookmark && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onToggleBookmark} 
            className={`rounded-full shadow-lg backdrop-blur-sm ${isBookmarked ? 'bg-amber-600/40 border-amber-500' : 'bg-black/40 border-white/30'}`}
          >
            {isBookmarked ? (
              <Bookmark className="h-5 w-5 text-amber-400" fill="currentColor" />
            ) : (
              <BookmarkPlus className="h-5 w-5 text-white" />
            )}
          </Button>
        )}
      </div>
      
      {/* Notes Panel - Desktop */}
      {!isMobile && showNotes && (
        <div className="absolute top-0 right-0 bottom-0 w-96 bg-background/95 backdrop-blur-sm border-l z-30 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">Anotações</h3>
            <Button variant="ghost" size="sm" onClick={toggleNotes}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            <Textarea 
              placeholder="Digite suas anotações aqui..."
              className="min-h-[200px] resize-none h-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {/* Notes Panel - Mobile */}
      {isMobile && (
        <Sheet open={showNotes} onOpenChange={setShowNotes}>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader className="mb-4">
              <SheetTitle>Anotações</SheetTitle>
              <SheetDescription>
                Faça suas anotações sobre este curso
              </SheetDescription>
            </SheetHeader>
            <div className="flex-grow">
              <Textarea 
                placeholder="Digite suas anotações aqui..."
                className="min-h-[40vh]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Hidden controls overlay triggered by button */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm transition-all z-30">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="bg-transparent border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={cycleVolume}
                className="bg-transparent border-white/20 text-white hover:bg-white/20"
              >
                <VolumeIcon className="mr-1 h-4 w-4" />
                {volume === "muted" ? "Sem som" : volume === "low" ? "Baixo" : "Normal"}
              </Button>
            </div>
            
            <div className="flex gap-2">
              {onToggleBookmark && (
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleBookmark}
                  className={isBookmarked ? "bg-primary" : "bg-transparent border-white/20 text-white hover:bg-white/20"}
                >
                  {isBookmarked ? <Bookmark className="mr-1 h-4 w-4" /> : <BookmarkPlus className="mr-1 h-4 w-4" />}
                  {isBookmarked ? "Marcado" : "Marcar"}
                </Button>
              )}
              
              <Button
                variant={showNotes ? "default" : "outline"}
                size="sm"
                onClick={toggleNotes}
                className={showNotes ? "bg-primary" : "bg-transparent border-white/20 text-white hover:bg-white/20"}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Anotações
              </Button>
              
              {downloadUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(downloadUrl, '_blank')}
                  className="bg-transparent border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Material
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
