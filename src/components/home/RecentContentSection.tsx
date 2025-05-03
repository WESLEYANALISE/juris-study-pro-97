
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Book, Video, Headphones, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { RecentContent } from '@/hooks/useRecentContent';
import { formatRelativeTime } from '@/lib/utils';

interface RecentContentSectionProps {
  content: RecentContent[];
  isLoading: boolean;
}

export function RecentContentSection({ content, isLoading }: RecentContentSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="w-full h-16 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return null;
  }

  const getIcon = (type: RecentContent['type']) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'podcast':
        return <Headphones className="h-4 w-4 text-purple-500" />;
      case 'article':
        return <FileText className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeName = (type: RecentContent['type']) => {
    switch (type) {
      case 'book':
        return 'Livro';
      case 'video':
        return 'Vídeo';
      case 'podcast':
        return 'Podcast';
      case 'article':
        return 'Artigo';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 py-2"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Continuar estudando</span>
      </div>
      
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {content.slice(0, 6).map((item) => (
          <Link key={`${item.type}-${item.id}`} to={item.path}>
            <Card className="hover:shadow-md transition-shadow border-primary/10 hover:border-primary/30">
              <CardContent className="p-3 flex items-center space-x-3">
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted/60">
                  {item.thumbnail_url ? (
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      {getIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 inline-flex items-center">
                      {getIcon(item.type)}
                      <span className="ml-1">{getTypeName(item.type)}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.last_accessed)}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  
                  {item.progress !== undefined && (
                    <Progress value={item.progress} className="h-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
