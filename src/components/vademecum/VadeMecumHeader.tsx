
import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Volume, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SoundscapeVisualization } from '@/components/ui/soundscape-theme';

interface VadeMecumHeaderProps {
  title: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReload: () => void;
}

export function VadeMecumHeader({
  title,
  searchQuery,
  setSearchQuery,
  onReload
}: VadeMecumHeaderProps) {
  const [isSearching, setIsSearching] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInputRef.current) {
      setSearchQuery(searchInputRef.current.value);
    }
  };

  React.useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would start/stop audio playback
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex flex-col space-y-4">
        {/* Title and audio control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg bg-purple-900/20 backdrop-blur-sm border border-primary/20",
              "flex items-center justify-center"
            )}>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <motion.h2 
              className="text-2xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title || 'Vademecum'}
              {title && (
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Pesquise os artigos desta lei
                </div>
              )}
            </motion.h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              aria-label={isPlaying ? "Pausar áudio" : "Iniciar áudio"}
              className={cn(isPlaying && "text-primary")}
            >
              <Volume className="h-5 w-5" />
              {isPlaying && (
                <div className="absolute -right-1 -top-1">
                  <SoundscapeVisualization isPlaying={true} className="h-3" />
                </div>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReload}
              aria-label="Recarregar"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search form */}
        <div className="relative">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              className={cn(
                "pl-9 pr-4 transition-all duration-300",
                "bg-background/60 backdrop-blur-sm focus:bg-background/80",
                "border-primary/10 focus:border-primary/30"
              )}
              placeholder="Pesquisar artigos..."
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent">
            <motion.div 
              className="h-full bg-primary/40"
              initial={{ width: "0%" }}
              animate={{ width: searchQuery.length > 0 ? "100%" : "0%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
