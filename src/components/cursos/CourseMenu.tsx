
import { Play, Download, PencilLine, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export function CourseMenu({
  open,
  onOpenChange,
  onStartCourse,
  title,
  description,
  downloadUrl,
}: CourseMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={onStartCourse} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Iniciar agora
          </Button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download de material de apoio
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Em breve!",
                description: "Funcionalidade em desenvolvimento",
              })
            }
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Anotações
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
