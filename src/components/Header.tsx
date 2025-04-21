
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { type ProfileType } from "@/components/WelcomeModal";
import SearchBar from "@/components/SearchBar";
import { Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface HeaderProps {
  userProfile: ProfileType;
  pageTitle?: string | null;
}

export function Header({ userProfile, pageTitle }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6"
    >
      <div className="hidden md:flex">
        <SidebarTrigger />
      </div>
      
      {pageTitle ? (
        <div className="flex items-center overflow-hidden">
          <h1 className="font-bold text-lg truncate">{pageTitle}</h1>
        </div>
      ) : (
        <div 
          className="flex items-center mr-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Scale className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg hidden sm:inline">JurisStudy Pro</span>
        </div>
      )}
      
      {!isMobile && (
        <div className="flex-1 px-2">
          <SearchBar />
        </div>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        {isMobile ? (
          <div className="w-8 h-8">
            <ProfileSwitcher currentProfile={userProfile} />
          </div>
        ) : (
          <div className="w-40">
            <ProfileSwitcher currentProfile={userProfile} />
          </div>
        )}
      </div>
    </motion.header>
  );
}
