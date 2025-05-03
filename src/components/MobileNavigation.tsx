
import * as React from "react";
import { Home, BookOpenText, Video, Brain, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

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
  }, []);
  
  // Don't render if PDF viewer is open
  if (isPdfViewerOpen) {
    return null;
  }
  
  return (
    <motion.nav 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2 md:hidden shadow-lg",
        isPdfViewerOpen ? "hidden" : ""
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
                  "flex flex-col items-center px-2 py-1 text-xs",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full mb-1",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
