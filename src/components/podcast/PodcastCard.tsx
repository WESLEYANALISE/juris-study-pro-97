
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodcastCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  publishedAt: string;
  categories?: { name: string; slug: string }[];
  tags?: string[];
  area?: string;
  commentCount?: number;
  likeCount?: number;
  onClick?: () => void;
}

export function PodcastCard({
  id,
  title,
  description,
  thumbnail,
  duration,
  publishedAt,
  categories,
  tags,
  area,
  commentCount = 0,
  likeCount = 0,
  onClick
}: PodcastCardProps) {
  // Format date for display
  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(publishedAt), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (e) {
      return 'Data desconhecida';
    }
  }, [publishedAt]);

  return (
    <Card 
      className={cn(
        "overflow-hidden border border-purple-500/30 hover:border-purple-500/80 relative group cursor-pointer hover:shadow-xl transition-all duration-300",
        "bg-gradient-to-br from-background/95 to-purple-950/20 backdrop-blur-sm hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Podcast image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://avatar.vercel.sh/podcast-${id}?size=256`;
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-foreground/40"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
            }}
          >
            <span className="text-3xl font-bold opacity-20">🎙️</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        {/* Main category badge */}
        {categories && categories[0] && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-purple-600/90 text-white hover:bg-purple-700 backdrop-blur-sm"
          >
            {categories[0].name}
          </Badge>
        )}
      </div>
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent">
        <h3 className="font-semibold text-base line-clamp-2 text-white mb-1 group-hover:text-purple-200 transition-colors">
          {title}
        </h3>
        
        <p className="text-xs text-white/90 line-clamp-1 mb-2">
          {area || 'Podcast jurídico'}
        </p>
        
        {/* Stats and date */}
        <div className="flex justify-between items-center text-xs text-white/70">
          <div className="flex space-x-2">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {likeCount}
            </span>
          </div>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Animated overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </Card>
  );
}
