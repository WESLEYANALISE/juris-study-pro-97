
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Headphones, Heart, Music } from "lucide-react";
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
  tags?: string[];
  area?: string;
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
  tags,
  onClick
}: PodcastCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 10 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full will-change-transform"
      onClick={onClick}
    >
      <Card className="cursor-pointer h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-primary/10 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={thumbnail || "https://via.placeholder.com/300x200?text=Podcast"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </div>
          )}
          {isFavorite && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="absolute top-2 right-2"
            >
              <Badge variant="default" className="flex gap-1 items-center bg-primary/90 shadow-md">
                <Heart className="h-3 w-3 fill-current" />
                Favorito
              </Badge>
            </motion.div>
          )}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (progress * 100))}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-primary"
              />
            </div>
          )}

          {/* Overlay gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-medium truncate">{title}</p>
            </div>
          </div>
        </div>
        <CardContent className="flex-1 py-4">
          <h3 className="font-semibold line-clamp-2 text-base">{title}</h3>
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
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-primary-foreground/70 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(new Date(publishedAt))}
          </div>
          
          {progress !== undefined && (
            <div className="flex items-center gap-1">
              {progress > 0 && progress < 1 && (
                <Badge variant="secondary" className="text-xs">
                  <Headphones className="h-3 w-3 mr-1" />
                  {Math.round(progress * 100)}%
                </Badge>
              )}
              
              {progress === 1 && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700 dark:text-green-400">
                  Ouvido
                </Badge>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
