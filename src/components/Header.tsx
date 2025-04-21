
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/useAuth";
import { ProfileButton } from "@/components/auth/ProfileButton";
import { type ProfileType } from "@/components/WelcomeModal";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userProfile: ProfileType;
  pageTitle?: string | null;
  onProfileChange?: (profile: ProfileType) => void;
}

export function Header({ userProfile, pageTitle, onProfileChange }: HeaderProps) {
  const { onOpen } = useSidebar();
  const [hasScrolled, setHasScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 transition-shadow sm:px-6 lg:px-8 ${
        hasScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="flex flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onOpen} className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        {pageTitle && <h1 className="font-semibold text-xl">{pageTitle}</h1>}
      </div>

      <div className="hidden md:flex md:items-center md:space-x-4">
        {onProfileChange && <ProfileSwitcher value={userProfile} onValueChange={onProfileChange} />}
        <ThemeToggle />
        {isAuthenticated ? (
          <ProfileButton />
        ) : (
          <Button onClick={handleLoginClick}>Entrar</Button>
        )}
      </div>

      <div className="flex items-center md:hidden">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              {isAuthenticated ? (
                <ProfileButton />
              ) : (
                <Button onClick={handleLoginClick} size="sm">
                  Entrar
                </Button>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 py-4">
              {onProfileChange && <ProfileSwitcher value={userProfile} onValueChange={onProfileChange} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
