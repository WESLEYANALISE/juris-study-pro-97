
import { Bell, GraduationCap, Scale, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileMenu from "@/components/MobileMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface HeaderProps {
  userProfile: ProfileType;
}

export function Header({ userProfile }: HeaderProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Verificar status de autenticação ao montar o componente
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const profileIcons = {
    concurseiro: <GraduationCap className="h-4 w-4 mr-2" />,
    universitario: <User className="h-4 w-4 mr-2" />,
    advogado: <Scale className="h-4 w-4 mr-2" />,
    tudo: <User className="h-4 w-4 mr-2" />
  };

  const profileLabels = {
    concurseiro: "Concurseiro",
    universitario: "Universitário",
    advogado: "Advogado",
    tudo: "Acesso Completo"
  };

  const changeProfile = (profile: ProfileType) => {
    localStorage.setItem("juris-study-profile", profile);
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // After logout, redirect to login page
    navigate("/auth", { replace: true });
  };
  
  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center">
          <MobileMenu userProfile={userProfile} />
          <div className="text-sm text-muted-foreground hidden md:block">
            Seu perfil:
            <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded-md font-medium inline-flex items-center">
              {profileIcons[userProfile]}
              {profileLabels[userProfile]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative w-full max-w-sm md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="pl-8 w-full bg-background"
            />
          </div>
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Meu Perfil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={userProfile === "concurseiro" ? "bg-primary/20" : ""}
                onClick={() => changeProfile("concurseiro")}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Concurseiro</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "universitario" ? "bg-primary/20" : ""}
                onClick={() => changeProfile("universitario")}
              >
                <User className="h-4 w-4 mr-2" />
                <span>Universitário</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "advogado" ? "bg-primary/20" : ""}
                onClick={() => changeProfile("advogado")}
              >
                <Scale className="h-4 w-4 mr-2" />
                <span>Advogado</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "tudo" ? "bg-primary/20" : ""}
                onClick={() => changeProfile("tudo")}
              >
                <User className="h-4 w-4 mr-2" />
                <span>Acesso Completo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isLoggedIn ? (
                <DropdownMenuItem onClick={handleLogin}>
                  <User className="h-4 w-4 mr-2" />
                  <span>Fazer Login</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
