
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Compass, Newspaper, MessageSquare, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      name: "Ferramentas",
      icon: Scale,
      path: "/ferramentas-juridicas"
    },
    {
      name: "Assistente",
      icon: MessageSquare,
      path: "/assistente"
    }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-card border-t border-border p-2 safe-area-bottom md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <motion.button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-2 rounded-md min-h-[48px] w-full 
              ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            whileTap={{ scale: 0.92 }}
          >
            <motion.div
              animate={isActive ? { 
                y: [0, -4, 0],
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              <item.icon className="h-5 w-5 mb-1" />
            </motion.div>
            <span className="text-xs">{item.name}</span>
            
            {isActive && (
              <motion.div
                className="absolute bottom-1 w-6 h-1 bg-primary rounded-full"
                layoutId="navIndicator"
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default MobileNavigation;
