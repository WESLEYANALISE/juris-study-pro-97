
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

interface MobileMenuProps {
  userProfile: ProfileType;
}

// Menu items with category grouping for better organization
const menuItems = [
  { 
    category: "Início e Aprendizado",
    items: [
      { title: "Início", url: "/", icon: "Home" },
      { title: "Iniciando no Direito", url: "/inicie", icon: "Lightbulb" },
      { title: "Cursos", url: "/cursos", icon: "BookOpenText" }
    ]
  },
  {
    category: "Conteúdos",
    items: [
      { title: "Vídeo-aulas", url: "/videoaulas", icon: "Video" },
      { title: "Biblioteca", url: "/biblioteca", icon: "Library" },
      { title: "Vade-Mecum", url: "/vademecum", icon: "BookOpen" },
      { title: "Dicionário", url: "/dicionario", icon: "BookOpen" },
      { title: "Mapas Mentais", url: "/mapas-mentais", icon: "Brain" },
      { title: "JurisFlix", url: "/jurisflix", icon: "Film" }
    ]
  },
  {
    category: "Ferramentas de Estudo",
    items: [
      { title: "Simulados", url: "/simulados", icon: "GraduationCap" },
      { title: "Flashcards", url: "/flashcards", icon: "Brain" },
      { title: "Redação Jurídica", url: "/redacao-juridica", icon: "FileText" },
      { title: "Peticionário", url: "/peticoes", icon: "FilePlus" },
      { title: "Jurisprudência", url: "/jurisprudencia", icon: "Gavel" },
      { title: "Notícias", url: "/noticias", icon: "Newspaper" },
      { title: "Assistente", url: "/assistente", icon: "MessageSquare" },
      { title: "Anotações", url: "/anotacoes", icon: "PenTool" }
    ]
  },
  {
    category: "Conta",
    items: [
      { title: "Perfil", url: "/perfil", icon: "User" }
    ]
  }
];

const MobileMenu = ({ userProfile }: MobileMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    // Generate path segments for breadcrumb
    const pathSegments = location.pathname.split('/').filter(Boolean);
    setCurrentPath(pathSegments);
  }, [location]);

  // Filter menu items based on user profile
  const filteredMenuCategories = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item => 
      !item.url.includes("remote") || userProfile === "tudo" // Only show remote desktop for "tudo" profile
    )
  })).filter(category => category.items.length > 0);
  
  if (!isMobile) return null;
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden min-h-[44px] min-w-[44px]">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <span className="font-bold text-xl">JurisStudy</span>
              <Badge variant="outline" className="ml-auto">
                {userProfile === "concurseiro" ? "Concurseiro" : 
                 userProfile === "universitario" ? "Universitário" : 
                 userProfile === "advogado" ? "Advogado" : "Completo"}
              </Badge>
            </SheetTitle>
          </SheetHeader>
          
          {/* Breadcrumb navigation for current location */}
          {currentPath.length > 0 && (
            <div className="px-4 py-2 border-b">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={() => {
                          navigate("/");
                          setIsOpen(false);
                        }}
                      >
                        Início
                      </Button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentPath.map((segment, index) => (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs"
                            onClick={() => {
                              navigate(`/${currentPath.slice(0, index + 1).join('/')}`);
                              setIsOpen(false);
                            }}
                          >
                            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                          </Button>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          
          <ScrollArea className="h-[calc(100vh-4rem)]">
            {filteredMenuCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="py-2">
                <h3 className="px-4 text-xs uppercase font-semibold text-muted-foreground mb-2">
                  {category.category}
                </h3>
                <div className="px-4 space-y-1">
                  {category.items.map((item) => {
                    const isActive = location.pathname === item.url || 
                                    (item.url !== "/" && location.pathname.startsWith(item.url));
                    return (
                      <Button
                        key={item.title}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto py-3 min-h-[44px]"
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
              </div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMenu;
