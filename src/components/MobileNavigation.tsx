
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Compass, Newspaper, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/"
    },
    {
      name: "Biblioteca",
      icon: BookOpen,
      path: "/biblioteca"
    },
    {
      name: "Explorar",
      icon: Compass,
      path: "/explorar"
    },
    {
      name: "Bloger",
      icon: Newspaper,
      path: "/bloger"
    },
    {
      name: "Assistente",
      icon: MessageSquare,
      path: "/assistente"
    }
  ];

  // Ensure navItems is an array before mapping
  const itemsArray = Array.isArray(navItems) ? navItems : [];

  if (itemsArray.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-card border-t border-border p-2 md:hidden">
      {itemsArray.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md",
            location.pathname === item.path 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileNavigation;
