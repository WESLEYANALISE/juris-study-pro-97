
import { type YouTubeVideo } from "@/lib/youtube-service";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface VideoCardProps {
  video: YouTubeVideo;
  isSelected?: boolean;
  onClick: () => void;
  searchTerm?: string;
}

export const VideoCard = ({ video, isSelected, onClick, searchTerm = "" }: VideoCardProps) => {
  // Highlight the matching text in the title if there's a search term
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-primary/20 text-primary">{part}</span> : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`cursor-pointer hover:border-primary transition-colors ${isSelected ? 'border-primary bg-accent' : ''}`}
        onClick={onClick}
      >
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={video.thumbnail || "/placeholder.svg"} 
              alt={video.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
            {video.duration}
          </div>
        </div>
        <CardHeader className="p-3">
          <CardTitle className="text-sm line-clamp-2">
            {highlightMatch(video.title)}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            {video.channelTitle}
            <span className="mx-1">•</span>
            {video.publishedAt?.split('T')[0]}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};
