
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookmarkPlus, Bookmark, MessageSquare, Download, Volume2, Volume1, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const [volume, setVolume] = useState<"muted" | "low" | "normal">("normal");
  const localVideoRef = useRef<HTMLIFrameElement>(null);
  const actualVideoRef = videoRef || localVideoRef;
  const notesTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
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
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
  };
  
  const youtubeId = videoUrl.includes('youtube') || videoUrl.includes('youtu.be') 
    ? getYoutubeId(videoUrl) 
    : null;

  const cycleVolume = () => {
    const volumes: Array<"muted" | "low" | "normal"> = ["normal", "low", "muted"];
    const currentIndex = volumes.findIndex(v => v === volume);
    const nextIndex = (currentIndex + 1) % volumes.length;
    setVolume(volumes[nextIndex]);
    
    // If we had direct access to the YouTube player API, we would adjust volume here
  };
  
  const VolumeIcon = volume === "muted" ? VolumeX : volume === "low" ? Volume1 : Volume2;

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="p-2 sm:p-4 flex items-center justify-between border-b bg-card">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-sm sm:text-lg font-semibold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {onToggleBookmark && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleBookmark}
              title={isBookmarked ? "Remover marcador" : "Adicionar marcador"}
            >
              {isBookmarked ? (
                <Bookmark className="h-5 w-5 fill-current" />
              ) : (
                <BookmarkPlus className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={cycleVolume}
            title={`Volume: ${volume}`}
          >
            <VolumeIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {updateProgress !== undefined && (
        <div className="px-4 py-1">
          <Progress value={progress} className="h-1" />
        </div>
      )}
      
      <div className="flex-grow w-full px-0 sm:px-4 py-0 sm:py-4">
        <div className="w-full h-full max-h-[calc(100vh-130px)]">
          <AspectRatio ratio={16/9} className="sm:rounded-lg overflow-hidden bg-black">
            <iframe
              ref={actualVideoRef}
              src={youtubeId 
                ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` 
                : videoUrl
              }
              className="w-full h-full border-0"
              title={title}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </AspectRatio>
        </div>
      </div>
      
      <div className="p-2 sm:p-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showNotes ? "Ocultar notas" : "Mostrar notas"}
          </Button>
          
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Material de apoio
              </Button>
            </a>
          )}
        </div>
        
        {updateProgress !== undefined && (
          <div className="text-sm text-muted-foreground">
            {progress >= 100 
              ? "Curso concluído" 
              : `Progresso: ${progress}%`
            }
          </div>
        )}
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
              className="min-h-[300px] resize-none"
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
