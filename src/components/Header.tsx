
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, X, Search, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MobileMenu from "./MobileMenu";
import { motion } from "framer-motion";

interface HeaderProps {
  userProfile?: string;
}

export function Header({ userProfile = "basic" }: HeaderProps) {
  const { toggle } = useSidebar();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b border-white/5 backdrop-blur-xl bg-background/80"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={toggle} className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {isMobile ? (
            <MobileMenu userProfile={userProfile} />
          ) : null}

          <Link to="/" className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple"
            >
              <motion.span 
                className="font-bold text-white text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  repeatType: "reverse", 
                  ease: "easeInOut" 
                }}
              >
                J
              </motion.span>
            </motion.div>
            <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
              JurisStudy
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {user ? (
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/perfil">
                <Avatar className="border-2 border-purple-500/30 hover:border-purple-500/60 transition-colors">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/50 to-purple-700/50">
                    {user.email?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </motion.div>
          ) : (
            <Button variant="default" onClick={() => navigate("/auth")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
