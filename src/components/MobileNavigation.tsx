
import * as React from "react";
import { Home, BookOpenText, Video, Brain, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";

// Define menu navigation items
const navItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Cursos", href: "/cursos", icon: BookOpenText },
  { name: "Vídeos", href: "/videoaulas", icon: Video },
  { name: "Estudar", href: "/questoes", icon: Brain },
  { name: "Perfil", href: "/perfil", icon: User }
];

// Mobile navigation component with improved PDF viewer detection
export default function MobileNavigation() {
  const location = useLocation();
  const { state } = useSidebar();
  const [isPdfViewerOpen, setIsPdfViewerOpen] = React.useState(false);
  
  React.useEffect(() => {
    // Enhanced PDF viewer detection that checks body class
    const checkPdfViewer = () => {
      const isPdfOpen = document.body.classList.contains('pdf-viewer-open');
      setIsPdfViewerOpen(isPdfOpen);
    };
    
    // Initial check
    checkPdfViewer();
    
    // Watch for class changes on body element to detect PDF viewer state
    const observer = new MutationObserver(checkPdfViewer);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, [location.pathname]);
  
  // Don't render if PDF viewer is open
  if (isPdfViewerOpen) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-glass-darker backdrop-blur-lg p-2 md:hidden shadow-lg border border-white/10"
        )}
      >
        <ul className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (location.pathname !== "/" && item.href !== "/" && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center px-2 py-1 text-xs transition-all",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full mb-1",
                      isActive && "bg-primary/20 shadow-glow"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform",
                      isActive && "text-primary animate-pulse-once" // Custom animation for active icon
                    )} />
                  </motion.div>
                  <span className={cn(
                    "transition-all",
                    isActive && "font-medium"
                  )}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </AnimatePresence>
  );
}
