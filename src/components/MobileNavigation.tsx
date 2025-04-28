
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, FileText, User, Lightbulb, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // If not mobile, don't render the component
  if (!isMobile) return null;
  
  const navItems = [
    {
      name: "Início",
      icon: Home,
      path: "/"
    },
    {
      name: "Iniciando",
      icon: Lightbulb,
      path: "/inicie"
    },
    {
      name: "Vídeo-aulas",
      icon: Video,
      path: "/videoaulas"
    },
    {
      name: "Redação",
      icon: FileText,
      path: "/redacao-juridica"
    },
    {
      name: "Vade-Mecum",
      icon: BookOpen,
      path: "/vademecum"
    },
    {
      name: "Perfil",
      icon: User,
      path: "/perfil"
    }
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around bg-card border-t border-border p-2 md:hidden safe-bottom"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== "/" && location.pathname.startsWith(item.path));
        
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200 w-1/5 min-h-[44px]",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary"
            )}
            aria-label={item.name}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate w-full text-center">{item.name}</span>
          </button>
        );
      })}
    </motion.div>
  );
};

export default MobileNavigation;
