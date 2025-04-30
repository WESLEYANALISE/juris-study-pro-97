
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Headphones, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration, formatRelativeTime } from '@/lib/utils';

interface PodcastCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: number;
  publishedAt: string;
  isFavorite?: boolean;
  progress?: number;
  categories?: { name: string; slug: string }[];
  onClick?: () => void;
}

export function PodcastCard({
  title,
  description,
  thumbnail,
  duration,
  publishedAt,
  isFavorite,
  progress,
  categories,
  onClick
}: PodcastCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
      onClick={onClick}
    >
      <Card className="cursor-pointer h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-video">
          <img 
            src={thumbnail || "https://via.placeholder.com/300x200?text=Podcast"}
            alt={title}
            className="w-full h-full object-cover"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </div>
          )}
          {isFavorite && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="flex gap-1 items-center">
                <Heart className="h-3 w-3" />
                Favorito
              </Badge>
            </div>
          )}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div 
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, (progress * 100))}%` }}
              />
            </div>
          )}
        </div>
        <CardContent className="flex-1 py-4">
          <h3 className="font-semibold line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>
          
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {categories.slice(0, 2).map(category => (
                <Badge key={category.slug} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(new Date(publishedAt))}
          </div>
          
          {progress !== undefined && progress > 0 && progress < 1 && (
            <div className="flex items-center gap-1 text-xs">
              <Headphones className="h-3 w-3" />
              {Math.round(progress * 100)}% concluído
            </div>
          )}
          
          {progress === 1 && (
            <Badge variant="secondary" className="text-xs">
              Ouvido
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
