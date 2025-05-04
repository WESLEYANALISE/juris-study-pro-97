
import React from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface HeaderProps {
  userProfile: ProfileType;
}

export function Header({ userProfile }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    setCurrentPath(pathSegments);
  }, [location]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
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
    toast.success(`Perfil alterado para ${profileLabels[profile]}`);
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth", { replace: true });
  };
  
  const handleLogin = () => {
    navigate("/auth");
  };
  
  const getCurrentPageTitle = () => {
    if (currentPath.length === 0) return "Início";
    
    const lastSegment = currentPath[currentPath.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-white/5 bg-glass-darker backdrop-blur-md safe-top">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container flex h-16 items-center px-4 md:px-6"
      >
        <div className="flex items-center">
          <MobileMenu userProfile={userProfile} />
          <div className="text-sm text-muted-foreground hidden md:flex md:items-center">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => navigate("/")}
                    >
                      Início
                    </Button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {currentPath.length > 0 && currentPath.map((segment, index) => (
                  <React.Fragment key={segment}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === currentPath.length - 1 ? (
                        <span className="font-medium text-foreground">
                          {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ').replace(/%20/g, ' ').replace(/%C3%B3/g, 'ó')}
                        </span>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto"
                            onClick={() => navigate(`/${currentPath.slice(0, index + 1).join('/')}`)}
                          >
                            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ').replace(/%20/g, ' ').replace(/%C3%B3/g, 'ó')}
                          </Button>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-6 bg-primary/10 text-primary px-2 py-1 rounded-md font-medium inline-flex items-center">
              {profileIcons[userProfile]}
              {profileLabels[userProfile]}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {isMobile ? (
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 min-w-[40px] min-h-[40px] hover:bg-white/5 hover:shadow-glow transition-all duration-200">
                  <Search className="h-5 w-5 text-primary" />
                  <span className="sr-only">Pesquisar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="p-0 pt-safe-top bg-glass-darker border-white/5">
                <div className="p-4 pt-12">
                  <Input
                    type="search"
                    placeholder="Pesquisar..."
                    className="w-full bg-black/30 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                    autoFocus
                  />
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 text-primary">Pesquisas recentes</h3>
                    <div className="grid gap-1">
                      {["Direito Civil", "Código Penal", "Contratos", "Habeas Corpus"].map((term) => (
                        <Button 
                          key={term} 
                          variant="ghost" 
                          className="justify-start h-auto py-2 hover:bg-white/5 hover:text-primary"
                          onClick={() => {
                            toast.info(`Pesquisando por "${term}"...`);
                            setIsSearchOpen(false);
                          }}
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="relative w-full max-w-sm md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="pl-8 w-full bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          )}
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 min-w-[40px] min-h-[40px] relative hover:bg-white/5 hover:shadow-glow transition-all duration-200"
              onClick={() => toast.info("Notificações em breve...")}
            >
              <Bell className="h-5 w-5 text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow"></span>
              <span className="sr-only">Notificações</span>
            </Button>
          </motion.div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 min-w-[40px] min-h-[40px] hover:bg-white/5 hover:shadow-glow transition-all duration-200"
              >
                <User className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50 bg-glass-darker border-white/5 backdrop-blur-xl">
              <DropdownMenuLabel className="text-primary">Meu Perfil</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className={userProfile === "concurseiro" ? "bg-primary/20 text-primary" : "hover:bg-white/5 hover:text-primary"}
                onClick={() => changeProfile("concurseiro")}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Concurseiro</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "universitario" ? "bg-primary/20 text-primary" : "hover:bg-white/5 hover:text-primary"}
                onClick={() => changeProfile("universitario")}
              >
                <User className="h-4 w-4 mr-2" />
                <span>Universitário</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "advogado" ? "bg-primary/20 text-primary" : "hover:bg-white/5 hover:text-primary"}
                onClick={() => changeProfile("advogado")}
              >
                <Scale className="h-4 w-4 mr-2" />
                <span>Advogado</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={userProfile === "tudo" ? "bg-primary/20 text-primary" : "hover:bg-white/5 hover:text-primary"}
                onClick={() => changeProfile("tudo")}
              >
                <User className="h-4 w-4 mr-2" />
                <span>Acesso Completo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {!isLoggedIn ? (
                <DropdownMenuItem 
                  onClick={handleLogin}
                  className="hover:bg-white/5 hover:text-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Fazer Login</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </header>
  );
}
