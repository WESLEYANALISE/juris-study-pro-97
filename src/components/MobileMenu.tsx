
import * as React from "react";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ProfileType } from "@/components/WelcomeModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileMenuProps {
  userProfile: ProfileType;
}

// Menu items for sidebar
const menuItems = [
  { title: "Início", url: "/", icon: "Home" },
  { title: "Iniciando no Direito", url: "/inicie", icon: "Lightbulb" },
  { title: "Vídeo-aulas", url: "/videoaulas", icon: "Video" },
  { title: "Biblioteca", url: "/biblioteca", icon: "Library" },
  { title: "Vade-Mecum", url: "/vademecum", icon: "BookOpen" },
  { title: "Dicionário", url: "/dicionario", icon: "BookOpen" },
  { title: "Mapas Mentais", url: "/mapas-mentais", icon: "Brain" },
  { title: "Simulados", url: "/simulados", icon: "GraduationCap" },
  { title: "Flashcards", url: "/flashcards", icon: "Brain" },
  { title: "Peticionário", url: "/peticoes", icon: "FilePlus" },
  { title: "JurisFlix", url: "/jurisflix", icon: "Film" },
  { title: "Jurisprudência", url: "/jurisprudencia", icon: "Gavel" },
  { title: "Notícias", url: "/noticias", icon: "Newspaper" },
  { title: "Assistente", url: "/assistente", icon: "MessageSquare" },
  { title: "Redação Jurídica", url: "/redacao-juridica", icon: "FileText" },
  { title: "Perfil", url: "/perfil", icon: "User" }
];

const MobileMenu = ({ userProfile }: MobileMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  // Filter menu items based on user profile
  const filteredMenuItems = menuItems.filter(item => 
    !item.url.includes("remote") // Filter out remote desktop for simplicity
  );
  
  if (!isMobile) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <span className="font-bold text-xl">JurisStudy</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Button
                  key={item.title}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => {
                    navigate(item.url);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{item.title}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
