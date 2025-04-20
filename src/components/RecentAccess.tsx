
import { useEffect, useState } from "react";
import { BookOpen, Video, Newspaper, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  // Mock data for recent access items
  const recentItems: RecentItem[] = [
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
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />;
      case "article": return <Newspaper className="h-4 w-4 text-teal-500" />;
      case "document": return <FileText className="h-4 w-4 text-rose-500" />;
      case "book": return <BookOpen className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Make sure we have valid items before slicing
  const visibleItems = recentItems && recentItems.length > 0 
    ? recentItems.slice(currentIndex, currentIndex + Math.min(3, recentItems.length - currentIndex))
    : [];
  
  const nextSlide = () => {
    if (recentItems && currentIndex < recentItems.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Acessos Recentes</h2>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={nextSlide}
            disabled={!recentItems || currentIndex >= recentItems.length - 3}
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
