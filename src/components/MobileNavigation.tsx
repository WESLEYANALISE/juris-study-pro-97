
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, BookOpenText, Compass, Film, User, ScrollText, Lightbulb } from "lucide-react";
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
      name: "Iniciando",
      icon: Lightbulb,
      path: "/iniciando-no-direito"
    },
    {
      name: "Cursos",
      icon: BookOpenText,
      path: "/cursos"
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
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-card border-t border-border p-2 md:hidden"
    >
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200",
            location.pathname === item.path 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs">{item.name}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default MobileNavigation;
