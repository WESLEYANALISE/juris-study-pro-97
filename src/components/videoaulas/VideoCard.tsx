
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/lib/youtube-service";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: YouTubeVideo;
  isSelected?: boolean;
  onClick: () => void;
  searchTerm?: string;
}

export function VideoCard({ video, isSelected, onClick, searchTerm }: VideoCardProps) {
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchTerm?.toLowerCase() ? 
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
          part
        )}
      </>
    );
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      isSelected ? "border-primary ring-1 ring-primary" : ""
    )}>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-2 mb-1">
          {highlightMatch(video.title)}
        </h3>
        <p className="text-xs text-muted-foreground">
          {video.channelTitle}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={onClick}
        >
          {isSelected ? "Selecionado" : "Assistir"}
        </Button>
      </CardFooter>
    </Card>
  );
}
