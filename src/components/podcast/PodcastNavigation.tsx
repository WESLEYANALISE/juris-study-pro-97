
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Book, Headphones, GraduationCap, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SoundscapeVisualization } from '@/components/ui/soundscape-theme';

const navigationItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Book, label: 'Vademecum', path: '/vademecum' },
  { icon: Headphones, label: 'Podcasts', path: '/podcasts' },
  { icon: GraduationCap, label: 'Biblioteca', path: '/biblioteca' },
];

export default function PodcastNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [activeRoute, setActiveRoute] = React.useState('/');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  if (!isMobile) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t border-primary/10 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navigationItems.map((item) => {
          const isActive = activeRoute === item.path || 
                          (item.path !== '/' && activeRoute.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 -left-1 -bottom-1 flex items-center justify-center">
                    <SoundscapeVisualization isPlaying={true} className="h-6 opacity-40" />
                  </div>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActive ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="navigation-pill"
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Link>
          );
        })}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-16 h-full text-muted-foreground">
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="frosted-panel h-[70vh] rounded-t-xl border-primary/20">
            <div className="h-1.5 w-12 mx-auto mb-6 bg-muted rounded-full" />
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center">
                <Headphones className="mr-2 h-5 w-5 text-primary" />
                Menu Principal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Home, label: 'Início', path: '/' },
                  { icon: Book, label: 'Vademecum', path: '/vademecum' },
                  { icon: Headphones, label: 'Podcasts', path: '/podcasts' },
                  { icon: GraduationCap, label: 'Biblioteca', path: '/biblioteca' },
                  // Add more menu items here
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-background/30 border border-primary/10 hover:border-primary/30 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-8 w-8 mb-2 text-primary/70" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 py-4">
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  );
}
