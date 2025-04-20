
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { type ProfileType } from "@/components/WelcomeModal";
import SearchBar from "@/components/SearchBar";
import { Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  userProfile: ProfileType;
}

export function Header({ userProfile }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="hidden md:flex">
        <SidebarTrigger />
      </div>
      
      <div className="flex items-center mr-2 cursor-pointer" onClick={() => navigate("/")}>
        <Scale className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg hidden sm:inline">JurisStudy Pro</span>
      </div>
      
      {!isMobile && (
        <div className="flex-1 px-2">
          <SearchBar />
        </div>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="w-40">
          <ProfileSwitcher currentProfile={userProfile} />
        </div>
      </div>
    </header>
  );
}
