
import { useEffect, useState } from "react";
import { BookOpen, Video, Newspaper, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface RecentItem {
  id: string;
  title: string;
  type: "video" | "article" | "document" | "book";
  path: string;
  timestamp: string;
}

const RecentAccess = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAccess = async () => {
      try {
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        setRecentItems([
          {
            id: "1",
            title: "Direito Constitucional - Aula 3",
            type: "video",
            path: "/videoaulas",
            timestamp: "2h atrás"
          },
          {
            id: "2",
            title: "Reforma tributária 2025",
            type: "article",
            path: "/bloger",
            timestamp: "ontem"
          },
          {
            id: "3",
            title: "Manual de Direito Civil",
            type: "book",
            path: "/biblioteca",
            timestamp: "3d atrás"
          },
          {
            id: "4",
            title: "Recurso Extraordinário",
            type: "document",
            path: "/peticionario",
            timestamp: "5d atrás"
          }
        ]);
      } catch (error) {
        console.error("Error fetching recent access:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAccess();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />;
      case "article": return <Newspaper className="h-4 w-4 text-teal-500" />;
      case "document": return <FileText className="h-4 w-4 text-rose-500" />;
      case "book": return <BookOpen className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Ensure recentItems is an array before using array methods
  const itemsArray = Array.isArray(recentItems) ? recentItems : [];
  
  // Get visible items safely
  const visibleItems = itemsArray.slice(
    currentIndex, 
    currentIndex + Math.min(3, itemsArray.length - currentIndex)
  );
  
  const nextSlide = () => {
    if (itemsArray.length > 0 && currentIndex < itemsArray.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // If there are no items, don't render anything
  if (itemsArray.length === 0 && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full mb-4 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Acessos Recentes</h2>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 min-h-0" 
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 min-h-0" 
            onClick={nextSlide}
            disabled={currentIndex >= itemsArray.length - 3}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {visibleItems.map((item) => (
          <Card 
            key={item.id} 
            className="flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {getIcon(item.type)}
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              </div>
              <p className="text-sm font-medium truncate">{item.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentAccess;
