
import React, { useState } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { motion } from 'framer-motion';
import { AlertCircle, Headphones } from "lucide-react";
import { PodcastFilters } from '@/components/podcast/PodcastFilters';
import { PodcastList } from '@/components/podcast/PodcastList';
import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
  published_at: string;
  categories: { name: string; slug: string }[];
}

const Podcasts = () => {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  
  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto px-2 md:px-4 py-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 text-center mb-8"
        >
          <div className="relative inline-block mx-auto">
            <div className="flex justify-center mb-3">
              <Headphones className="h-16 w-16 text-primary" />
            </div>
            <motion.span
              className="absolute -inset-10 rounded-full opacity-10 bg-primary blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ zIndex: -1 }}
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Podcasts Jurídicos
          </h1>
          <p className="text-muted-foreground text-lg">
            Ouça os melhores conteúdos jurídicos em áudio
          </p>
        </motion.div>

        {selectedPodcast && (
          <div className="mb-8">
            <AudioPlayer
              id={selectedPodcast.id}
              title={selectedPodcast.title}
              audioUrl={selectedPodcast.audio_url}
              thumbnail={selectedPodcast.thumbnail_url}
              duration={selectedPodcast.duration}
            />
            <motion.div 
              className="mt-6 bg-primary/5 p-5 rounded-lg border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="font-medium text-xl mb-2">{selectedPodcast.title}</h3>
              <p className="text-muted-foreground">{selectedPodcast.description}</p>
              
              {selectedPodcast.categories && selectedPodcast.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Categorias:</span>
                  {selectedPodcast.categories.map(category => (
                    <span key={category.slug} className="text-sm text-primary">{category.name}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        <PodcastFilters 
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
        />
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos os Episódios</TabsTrigger>
            <TabsTrigger value="favorites">Meus Favoritos</TabsTrigger>
            <TabsTrigger value="inProgress">Em andamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              onSelectPodcast={setSelectedPodcast}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy={sortBy}
              showFavoritesOnly={true}
              onSelectPodcast={setSelectedPodcast}
            />
          </TabsContent>
          
          <TabsContent value="inProgress">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ouvidos recentemente</AlertTitle>
              <AlertDescription>
                Continue de onde parou. Aqui estão os podcasts que você começou a ouvir recentemente.
              </AlertDescription>
            </Alert>
            
            <PodcastList
              searchTerm={searchTerm}
              category={selectedCategory}
              sortBy="recent" // Override sort to recent for in-progress
              onSelectPodcast={setSelectedPodcast}
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-12" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Baixe nosso app</h2>
          <p className="text-muted-foreground mb-4">
            Continue ouvindo mesmo com o app fechado e receba notificações de novos episódios.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-black text-white px-6 py-2 rounded-lg">
              Download para iOS
            </button>
            <button className="bg-black text-white px-6 py-2 rounded-lg">
              Download para Android
            </button>
          </div>
        </div>
      </div>
    </JuridicalBackground>
  );
};

export default Podcasts;
