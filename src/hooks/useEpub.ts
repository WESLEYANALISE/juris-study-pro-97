
import { useState, useEffect, useRef } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface UseEpubProps {
  url?: string;
  file?: File | null;
  containerRef?: React.RefObject<HTMLDivElement>;
}

interface UseEpubReturn {
  book: Book | null;
  rendition: Rendition | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: any;
  totalPages: number;
  currentPage: number;
  progress: number;
  theme: 'light' | 'dark';
  fontSize: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
}

export const useEpub = ({ url, file, containerRef }: UseEpubProps): UseEpubReturn => {
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<number>(100);
  
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  // Load book from URL or File
  useEffect(() => {
    if (!url && !file) return;

    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let newBook: Book;

        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          newBook = ePub(arrayBuffer);
        } else if (url) {
          newBook = ePub(url);
        } else {
          throw new Error("No URL or file provided");
        }

        bookRef.current = newBook;
        setBook(newBook);

        // Get total pages for progress calculation
        newBook.ready.then(() => {
          if (newBook.spine) {
            setTotalPages(newBook.spine.length);
          }
        });

        // Initialize rendition
        const newRendition = newBook.renderTo("epub-view", {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated"
        });

        await newRendition.display();
        
        // Apply font size
        newRendition.themes.fontSize(`${fontSize}%`);
        
        // Set theme
        if (theme === 'dark') {
          newRendition.themes.register("dark", {
            body: { 
              color: "#e1e1e1 !important", 
              background: "#222 !important" 
            }
          });
          newRendition.themes.select("dark");
        }

        // Handle page change
        newRendition.on("locationChanged", (loc: any) => {
          const currentLocation = loc;
          const spineItem = newBook.spine.get(loc.start.index);
          
          if (spineItem) {
            setCurrentPage(loc.start.index + 1);
            setProgress(((loc.start.index + 1) / totalPages) * 100);
          }
          
          setCurrentLocation(currentLocation);
        });

        renditionRef.current = newRendition;
        setRendition(newRendition);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error loading EPUB:", err);
        setError(err.message || "Failed to load EPUB");
        setIsLoading(false);
      }
    };

    loadBook();

    // Cleanup function
    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [url, file]);

  // Update font size when it changes
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  // Update theme when it changes
  useEffect(() => {
    if (rendition) {
      if (theme === 'dark') {
        rendition.themes.register("dark", {
          body: { 
            color: "#e1e1e1 !important", 
            background: "#222 !important" 
          }
        });
        rendition.themes.select("dark");
      } else {
        rendition.themes.register("light", {
          body: { 
            color: "#000 !important", 
            background: "#fff !important" 
          }
        });
        rendition.themes.select("light");
      }
    }
  }, [theme, rendition]);

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleSetFontSize = (size: number) => {
    setFontSize(size);
  };

  return {
    book: bookRef.current,
    rendition: renditionRef.current,
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
    setTheme: handleSetTheme,
    setFontSize: handleSetFontSize
  };
};

export default useEpub;
