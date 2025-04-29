
import * as React from "react";
import { Home, BookOpenText, Video, Brain, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

// Define os itens do menu de navegação móvel
const navItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Cursos", href: "/cursos", icon: BookOpenText },
  { name: "Vídeos", href: "/videoaulas", icon: Video },
  { name: "Estudar", href: "/questoes", icon: Brain },
  { name: "Perfil", href: "/perfil", icon: User }
];

// Componente de navegação para dispositivos móveis
export default function MobileNavigation() {
  const location = useLocation();
  const { state } = useSidebar();
  
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md p-1.5 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <ul className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (location.pathname !== "/" && item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <li key={item.name} className="relative">
              <Link
                to={item.href}
                className={cn(
                  "flex flex-col items-center px-2 py-1.5 text-xs rounded-lg transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-full -m-1.5 z-0"
                      layoutId="navHighlight"
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                      }}
                    />
                  )}
                  <motion.div 
                    className="relative z-10"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                  </motion.div>
                </div>
                <span className={cn(
                  "transition-all duration-200",
                  isActive && "font-medium"
                )}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                    layoutId="navIndicator"
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 30 
                    }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
