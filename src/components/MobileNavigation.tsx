
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
  const [isQuestionMode, setIsQuestionMode] = React.useState(false);
  const [isCourseViewer, setIsCourseViewer] = React.useState(false);
  
  React.useEffect(() => {
    // Enhanced PDF viewer, question mode and course viewer detection
    const checkScreenMode = () => {
      const isPdfOpen = document.body.classList.contains('pdf-viewer-open');
      const isInQuestionMode = document.body.classList.contains('questions-active');
      const isInCourseViewer = document.body.classList.contains('course-viewer-active');
      
      setIsPdfViewerOpen(isPdfOpen);
      setIsQuestionMode(isInQuestionMode);
      setIsCourseViewer(isInCourseViewer);
    };
    
    // Initial check
    checkScreenMode();
    
    // Watch for class changes on body element to detect modes
    const observer = new MutationObserver(checkScreenMode);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, [location.pathname]);
  
  // Don't render if PDF viewer is open, in question mode, or in course viewer mode
  if (isPdfViewerOpen || isQuestionMode || isCourseViewer) {
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
          "fixed bottom-4 left-4 right-4 z-50 rounded-2xl backdrop-blur-xl p-2 md:hidden",
          "border border-white/10 bg-black/40 shadow-[0_8px_32px_rgba(139,92,246,0.25)]"
        )}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-800/20 to-purple-900/30" />
        </div>
        
        <ul className="flex justify-around relative z-10">
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
                      "flex items-center justify-center w-10 h-10 rounded-full mb-1 relative",
                      isActive && "bg-primary/20"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navHighlight"
                        className="absolute inset-0 rounded-full bg-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5 relative z-10 transition-transform",
                      isActive && "text-primary"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "transition-all relative",
                    isActive && "font-medium"
                  )}>
                    {isActive && (
                      <motion.span
                        layoutId="navTextHighlight" 
                        className="absolute -inset-x-1 -inset-y-0.5 rounded-md -z-10 bg-primary/10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </AnimatePresence>
  );
}
