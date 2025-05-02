
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BookControls } from './BookControls';
import { useEpub } from '@/hooks/useEpub';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EpubViewerProps {
  url?: string;
  file?: File | null;
}

export const EpubViewer = ({ url, file }: EpubViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    book,
    rendition,
    isLoading,
    error,
    currentLocation,
    totalPages,
    currentPage,
    progress,
    theme,
    fontSize,
    goToNextPage,
    goToPrevPage,
    setTheme,
    setFontSize,
  } = useEpub({ url, file, containerRef });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextPage, goToPrevPage]);

  // Handle swipe gestures
  useEffect(() => {
    if (!containerRef.current) return;
    
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (diff > 50) { // Swiped left
        goToNextPage();
      } else if (diff < -50) { // Swiped right
        goToPrevPage();
      }
    };
    
    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNextPage, goToPrevPage]);

  if (error) {
    return (
      <div className="epub-error">
        <p>Erro ao carregar o e-book: {error}</p>
      </div>
    );
  }

  return (
    <div className={`epub-container ${theme === 'dark' ? 'night-mode' : ''}`}>
      {isLoading ? (
        <div className="epub-loading">
          <Skeleton className="h-[500px] w-full max-w-[600px]" />
          <p>Carregando e-book...</p>
        </div>
      ) : (
        <>
          <div 
            className="epub-view-container" 
            ref={containerRef}
            id="epub-container"
          >
            <div id="epub-view"></div>
          </div>
          <div className="epub-navigation">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevPage} 
              className="mr-2"
              aria-label="Página anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages || '?'}
            </span>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextPage} 
              className="ml-2"
              aria-label="Próxima página"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <BookControls 
            theme={theme}
            fontSize={fontSize}
            onThemeChange={setTheme}
            onFontSizeChange={setFontSize}
            progress={progress}
            currentLocation={currentLocation}
            book={book}
          />
        </>
      )}
    </div>
  );
};
