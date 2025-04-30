
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Podcast {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: number;
  audio_url: string;
}

interface FeaturedPodcastsProps {
  onSelectPodcast: (podcast: Podcast) => void;
}

export function FeaturedPodcasts({ onSelectPodcast }: FeaturedPodcastsProps) {
  const [featuredPodcasts, setFeaturedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPodcasts = async () => {
      setLoading(true);
      try {
        // In a production app, you might want to have a "featured" flag in your database
        // For now, we'll just get the most recent 3 podcasts
        const { data, error } = await supabase
          .from('podcasts')
          .select('id, title, description, thumbnail_url, duration, audio_url')
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (error) {
          throw error;
        }
        
        setFeaturedPodcasts(data || []);
      } catch (err) {
        console.error('Error fetching featured podcasts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (featuredPodcasts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mb-12">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Headphones className="h-5 w-5" />
        Podcasts em destaque
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {featuredPodcasts.map((podcast, index) => (
          <motion.div
            key={podcast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9]">
                <img 
                  src={podcast.thumbnail_url || "https://via.placeholder.com/400x225?text=Podcast"} 
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="rounded-full h-12 w-12"
                    onClick={() => onSelectPodcast(podcast)}
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
                
                {podcast.duration && (
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    {formatDuration(podcast.duration)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-base mb-2 line-clamp-2">{podcast.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{podcast.description}</p>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => onSelectPodcast(podcast)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ouvir agora
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
