
import React, { useState } from 'react';
import { PodcastList } from '@/components/podcast/PodcastList';
import { PageTransition } from '@/components/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { OptimizedPodcastPlayer } from '@/components/podcast/OptimizedPodcastPlayer'; 
import { SoundscapeCard } from '@/components/ui/soundscape-theme'; // Fixed import

export default function Podcasts() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('all');

  // Using optimized code structure with lazy loading approach
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Podcasts Jurídicos</h1>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border">
            <TabsList className="bg-transparent h-12 mb-[-1px]">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                Favoritos
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                Histórico
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                Recomendações
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <PodcastList />
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <PodcastList showFavoritesOnly={true} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <PodcastList sortBy="recent" />
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <PodcastList />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
