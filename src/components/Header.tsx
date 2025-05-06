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
import { type ProfileType } from "@/components/WelcomeModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState as useStateSafe } from "react";
import { Badge } from "@/components/ui/badge";
import { useGlobalSearch } from "@/hooks/use-global-search";
interface HeaderProps {
  userProfile?: ProfileType;
}
export function Header({
  userProfile = "concurseiro"
}: HeaderProps) {
  const sidebar = useSidebar();
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    globalSearchResults,
    handleGlobalSearch
  } = useGlobalSearch();

  // Function to handle sidebar toggle, checking if toggle exists first
  const handleSidebarToggle = () => {
    if (sidebar && typeof sidebar.toggleSidebar === 'function') {
      sidebar.toggleSidebar();
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page or section
      if (location.pathname.includes('biblioteca')) {
        // If we're in the library, search within the library
        const params = new URLSearchParams();
        params.append('query', searchQuery);
        navigate(`/biblioteca-juridica?${params.toString()}`);
      } else if (location.pathname.includes('vademecum')) {
        // If we're in vademecum, search there
        navigate(`/vademecum?search=${encodeURIComponent(searchQuery)}`);
      } else {
        // Otherwise do a global search
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchOpen(false);
    }
  };
  return <>
      <motion.header initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.3
    }} className="sticky top-0 z-40 w-full border-b border-gray-800 backdrop-blur-xl bg-gray-900/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && <Button variant="ghost" size="icon" onClick={handleSidebarToggle} className="shrink-0 text-gray-400 hover:text-white hover:bg-gray-800">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>}

            {isMobile ? <MobileMenu userProfile={userProfile} /> : null}

            <Link to="/" className="flex items-center gap-2">
              
              <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
                JurisStudy
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {user ? <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                <Link to="/perfil">
                  <Avatar className="border-2 border-purple-500/30 hover:border-purple-500/60 transition-colors">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800">
                      {user.email?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </motion.div> : <Button variant="default" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
                Login
              </Button>}
          </div>
        </div>
      </motion.header>
      
      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pesquisar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="O que você procura?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" autoFocus />
              </div>
              <Button type="submit">Buscar</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => {
              navigate("/biblioteca-juridica");
              setIsSearchOpen(false);
            }}>
                Biblioteca
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => {
              navigate("/jurisflix");
              setIsSearchOpen(false);
            }}>
                JurisFlix
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => {
              navigate("/vademecum");
              setIsSearchOpen(false);
            }}>
                Vade Mecum
              </Button>
            </div>

            {/* Add results preview here if search has query */}
            {searchQuery.trim().length > 2 && <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Resultados:</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  <div className="bg-muted/30 p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Questões</Badge>
                      <span className="text-sm line-clamp-1">Questão sobre {searchQuery}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Área: Direito Penal
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Biblioteca</Badge>
                      <span className="text-sm line-clamp-1">Livro relacionado a {searchQuery}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Área: Direito Civil
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Vade Mecum</Badge>
                      <span className="text-sm line-clamp-1">Artigo sobre {searchQuery}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Código Penal - Art. 121
                    </p>
                  </div>
                </div>
              </div>}
          </form>
        </DialogContent>
      </Dialog>
    </>;
}