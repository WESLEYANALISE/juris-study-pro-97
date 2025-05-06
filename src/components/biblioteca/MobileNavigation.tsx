
import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Clock, 
  Search, 
  Heart, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  areas: { name: string; count: number }[];
}

export function MobileNavigation({ activeTab, setActiveTab, areas }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handler for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 md:hidden">
      <div className="flex justify-around items-center">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center py-3 rounded-none h-auto px-1 flex-1 ${activeTab === 'areas' ? 'text-primary' : ''}`}
          onClick={() => setActiveTab('areas')}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Áreas</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center py-3 rounded-none h-auto px-1 flex-1 ${activeTab === 'favorites' ? 'text-primary' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart className="h-5 w-5 mb-1" />
          <span className="text-xs">Favoritos</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center py-3 rounded-none h-auto px-1 flex-1 ${activeTab === 'recent' ? 'text-primary' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          <Clock className="h-5 w-5 mb-1" />
          <span className="text-xs">Recentes</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center py-3 rounded-none h-auto px-1 flex-1 ${activeTab === 'search' ? 'text-primary' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search className="h-5 w-5 mb-1" />
          <span className="text-xs">Buscar</span>
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center py-3 rounded-none h-auto px-1 flex-1"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs">Áreas</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] max-w-xs p-0">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Áreas Jurídicas</span>
              </h2>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            
            <ScrollArea className="h-[calc(100vh-64px)] p-4">
              <Button
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={() => handleTabChange('books')}
              >
                <span>Todos os Livros</span>
              </Button>
              
              {areas.map(area => (
                <Button
                  key={area.name}
                  variant="ghost"
                  className="w-full justify-start mb-2"
                  onClick={() => {
                    // Simulate selecting this area by doing area selection + switching to books tab
                    setActiveTab('books');
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{area.name}</span>
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                    {area.count}
                  </span>
                </Button>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
