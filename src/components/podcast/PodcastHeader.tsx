
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HomeIcon, Search, HeadphonesIcon, Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface PodcastHeaderProps {
  userProfile?: string;
}

export function PodcastHeader({ userProfile }: PodcastHeaderProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Listen for scroll events
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled ? "frosted-glass shadow-md py-2" : "py-4"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full flex items-center justify-center">
              <HeadphonesIcon className="h-6 w-6 text-primary" />
            </div>
            {!isMobile && (
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">
                  <span className="text-primary">Juris</span>Study
                </span>
                <span className="text-xs text-muted-foreground">
                  Biblioteca Jurídica Digital
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1 mx-auto">
            <NavButton icon={<HomeIcon className="h-4 w-4" />} label="Início" to="/" />
            <NavButton icon={<HeadphonesIcon className="h-4 w-4" />} label="Podcasts" to="/podcasts" />
            <NavButton icon={<Search className="h-4 w-4" />} label="Pesquisar" to="/search" />
          </nav>
        )}

        {/* User menu */}
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
          )}
          
          <Link to="/profile">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage 
                src={user?.user_metadata?.avatar_url || undefined} 
                alt={user?.email || "User avatar"} 
              />
              <AvatarFallback className="bg-primary/20 text-foreground">
                {user?.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
      
      {/* Animated wave border */}
      <div className="sound-wave absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent">
        <motion.div 
          className="h-full bg-primary/60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }} 
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>
    </motion.header>
  );
}

// Navigation button component
function NavButton({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  const isActive = window.location.pathname === to;
  
  return (
    <Link to={to}>
      <Button 
        variant={isActive ? "glass" : "ghost"} 
        size="sm"
        className={cn(
          "relative px-4",
          isActive && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
        )}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  );
}
