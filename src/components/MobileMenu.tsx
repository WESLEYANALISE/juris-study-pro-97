import * as React from "react";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ProfileType } from "@/components/WelcomeModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  Home, 
  Lightbulb, 
  BookOpenText, 
  Video, 
  Library, 
  BookOpen, 
  Brain, 
  Film, 
  GraduationCap, 
  FileText, 
  FilePlus, 
  Gavel, 
  Newspaper, 
  MessageSquare, 
  PenTool, 
  User,
  GamepadIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  userProfile: ProfileType;
}

// Menu items with category grouping for better organization and icons added
const menuItems = [
  {
    category: "Início e Aprendizado",
    items: [
      {
        title: "Início",
        url: "/",
        icon: Home
      }, 
      {
        title: "Iniciando no Direito",
        url: "/inicie",
        icon: Lightbulb
      }, 
      {
        title: "Cursos",
        url: "/cursos",
        icon: BookOpenText
      }
    ]
  }, 
  {
    category: "Conteúdos",
    items: [
      {
        title: "Vídeo-aulas",
        url: "/videoaulas",
        icon: Video
      }, 
      {
        title: "Biblioteca",
        url: "/biblioteca",
        icon: Library
      }, 
      {
        title: "Vade-Mecum",
        url: "/vademecum",
        icon: BookOpen
      }, 
      {
        title: "Dicionário",
        url: "/dicionario",
        icon: BookOpen
      }, 
      {
        title: "Mapas Mentais",
        url: "/mapas-mentais",
        icon: Brain
      }, 
      {
        title: "JurisFlix",
        url: "/jurisflix",
        icon: Film
      }
    ]
  }, 
  {
    category: "Ferramentas de Estudo",
    items: [
      {
        title: "Simulados",
        url: "/simulados",
        icon: GraduationCap
      }, 
      {
        title: "Questões",
        url: "/questoes",
        icon: Brain
      },
      {
        title: "Flashcards",
        url: "/flashcards",
        icon: Brain
      },
      {
        title: "Jogos Jurídicos",
        url: "/jogos",
        icon: GamepadIcon
      },
      {
        title: "Redação Jurídica",
        url: "/redacao-juridica",
        icon: FileText
      }, 
      {
        title: "Peticionário",
        url: "/peticoes",
        icon: FilePlus
      }, 
      {
        title: "Jurisprudência",
        url: "/jurisprudencia",
        icon: Gavel
      }, 
      {
        title: "Notícias",
        url: "/noticias",
        icon: Newspaper
      }, 
      {
        title: "Assistente",
        url: "/assistente",
        icon: MessageSquare
      }, 
      {
        title: "Anotações",
        url: "/anotacoes",
        icon: PenTool
      }
    ]
  }, 
  {
    category: "Conta",
    items: [
      {
        title: "Perfil",
        url: "/perfil",
        icon: User
      }
    ]
  }
];

const MobileMenu = ({
  userProfile
}: MobileMenuProps) => {
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
    items: category.items.filter(item => !item.url.includes("remote") || userProfile === "tudo" // Only show remote desktop for "tudo" profile
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
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px] gradient-sidebar">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Direito 360
              </span>
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
              <motion.div 
                key={categoryIndex} 
                className="py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
              >
                <h3 className="px-4 text-xs uppercase font-semibold text-primary mb-2">
                  {category.category}
                </h3>
                <div className="px-4 space-y-1">
                  {category.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                      >
                        <Button 
                          variant={isActive ? "secondary" : "ghost"} 
                          className={cn(
                            "w-full justify-start text-left h-auto py-3 min-h-[44px]",
                            isActive ? 'bg-primary/20 text-primary' : ''
                          )}
                          onClick={() => {
                            navigate(item.url);
                            setIsOpen(false);
                          }}
                        >
                          {Icon && (
                            <span className={cn(
                              "mr-2 p-1 rounded-md",
                              isActive ? "bg-primary/10" : "bg-muted/30"
                            )}>
                              <Icon className="h-4 w-4" />
                            </span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMenu;
