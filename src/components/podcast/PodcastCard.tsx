
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Headphones, Clock, Heart, MessageSquare } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PodcastCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  publishedAt: string;
  onClick: () => void;
  isFavorite?: boolean;
  progress?: number;
  categories?: {
    name: string;
    slug: string;
  }[];
  tags?: string[];
  area?: string;
  commentCount?: number;
  likeCount?: number;
}

export function PodcastCard({
  id,
  title,
  description,
  thumbnail,
  duration,
  publishedAt,
  onClick,
  isFavorite,
  progress,
  categories,
  tags,
  area,
  commentCount = 0,
  likeCount = 0
}: PodcastCardProps) {
  // Format the published date
  const formattedDate = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
    locale: ptBR
  });
  
  // Format duration if available
  const formattedDuration = duration ? formatDuration(duration) : 'Duração desconhecida';
  
  // Default thumbnail if none provided
  const defaultThumbnail = "https://via.placeholder.com/300x200?text=Podcast";
  
  // Calculate progress width
  const progressWidth = progress !== undefined ? `${Math.min(100, progress * 100)}%` : '0%';
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        onClick={onClick}
        className={cn(
          "overflow-hidden cursor-pointer flex flex-col h-full border-primary/10 hover:shadow-md transition-all",
          isFavorite ? "ring-1 ring-primary/20" : ""
        )}
      >
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img 
              src={thumbnail || defaultThumbnail} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          
          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div 
                className="h-full bg-primary"
                style={{ width: progressWidth }}
              />
            </div>
          )}
          
          {/* Category badges */}
          {categories && categories.length > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm text-xs">
                {categories[0].name}
              </Badge>
            </div>
          )}
          
          {/* Duration badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-black/60 text-white backdrop-blur-sm text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formattedDuration}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium text-base line-clamp-2 mb-1">{title}</h3>
          
          {description && (
            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{description}</p>
          )}
          
          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Headphones className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Heart className={cn("h-3 w-3 mr-1", isFavorite ? "fill-red-500 text-red-500" : "")} />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
