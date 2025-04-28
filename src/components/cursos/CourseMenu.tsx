
import { Play, Download, PencilLine, Star, BookmarkPlus, Bookmark, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourseMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCourse: () => void;
  title: string;
  description: string;
  downloadUrl?: string | null;
  progress?: number;
  isComplete?: boolean;
  hasNotes?: boolean;
  onOpenNotes?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function CourseMenu({
  open,
  onOpenChange,
  onStartCourse,
  title,
  description,
  downloadUrl,
  progress = 0,
  isComplete = false,
  hasNotes = false,
  onOpenNotes,
  isBookmarked = false,
  onToggleBookmark
}: CourseMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {progress > 0 && !isComplete && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Seu progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => {
              onStartCourse();
              onOpenChange(false);
            }} 
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            {progress > 0 && !isComplete ? "Continuar curso" : "Iniciar agora"}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </a>
            )}
            
            <Button
              variant={hasNotes ? "secondary" : "outline"}
              onClick={onOpenNotes || (() => {
                onStartCourse();
                onOpenChange(false);
                setTimeout(() => {
                  toast({
                    title: "Anotações disponíveis",
                    description: "Clique no botão 'Mostrar notas' para visualizar suas anotações.",
                  });
                }, 1000);
              })}
            >
              <PencilLine className="mr-2 h-4 w-4" />
              {hasNotes ? "Ver anotações" : "Anotações"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: "Em breve!",
                  description: "Funcionalidade em desenvolvimento",
                })
              }
            >
              <Star className="mr-2 h-4 w-4" />
              Avaliar curso
            </Button>
            
            {onToggleBookmark && (
              <Button
                variant={isBookmarked ? "secondary" : "outline"}
                onClick={onToggleBookmark}
              >
                {isBookmarked ? (
                  <>
                    <Bookmark className="mr-2 h-4 w-4 fill-current" />
                    Marcado
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Marcar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
