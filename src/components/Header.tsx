
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSwitcher, type ProfileType } from "@/components/ProfileSwitcher";
import SearchBar from "@/components/SearchBar";
import { Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userProfile: ProfileType;
}

export function Header({ userProfile }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="hidden md:flex">
        <SidebarTrigger />
      </div>
      
      <div className="flex items-center mr-2 cursor-pointer" onClick={() => navigate("/")}>
        <Scale className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg hidden sm:inline">JurisStudy Pro</span>
      </div>
      
      <div className="flex-1 px-2">
        <SearchBar />
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <ProfileSwitcher profile={userProfile} />
      </div>
    </header>
  );
}
