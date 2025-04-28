
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseViewerProps {
  title: string;
  videoUrl: string;
  onBack: () => void;
}

export function CourseViewer({ title, videoUrl, onBack }: CourseViewerProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="p-4 flex items-center border-b bg-card">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold ml-4 truncate">{title}</h1>
      </div>
      <div className="flex-grow">
        <iframe
          src={videoUrl}
          className="w-full h-full border-0"
          title={title}
          allowFullScreen
        />
      </div>
    </div>
  );
}
