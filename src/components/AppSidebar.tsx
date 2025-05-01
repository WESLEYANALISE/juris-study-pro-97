import { Calendar, BookOpen, GraduationCap, Scale, Home, Video, Brain, FilePlus, Gavel, Newspaper, MessageSquare, Library, Trophy, MonitorPlay, Lightbulb, BookOpenText, FileText, PenTool, User, Headphones } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocation } from "react-router-dom";
import { type ProfileType } from "@/components/WelcomeModal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  userProfile: ProfileType;
}

// Define the interface for menu items
interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  profiles: string[];
  isNew?: boolean;
  isPremium?: boolean;
}

export function AppSidebar({ userProfile }: AppSidebarProps) {
  const location = useLocation();
  
  const menuCategories = [
    {
      label: "Principal",
      items: [
        { title: "Início", url: "/", icon: Home, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Iniciando no Direito", url: "/inicie", icon: Lightbulb, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Cursos", url: "/cursos", icon: BookOpenText, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
      ]
    },
    {
      label: "Conteúdo",
      items: [
        { title: "Vídeo-aulas", url: "/videoaulas", icon: Video, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Biblioteca", url: "/biblioteca", icon: Library, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Podcasts", url: "/podcasts", icon: Headphones, profiles: ["concurseiro", "universitario", "advogado", "tudo"], isNew: true },
        { title: "Vade-Mecum", url: "/vademecum", icon: BookOpen, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Dicionário", url: "/dicionario", icon: BookOpen, profiles: ["universitario", "advogado", "tudo"] },
        { title: "Mapas Mentais", url: "/mapas-mentais", icon: Brain, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
      ]
    },
    {
      label: "Ferramentas de Estudo",
      items: [
        { title: "Simulados", url: "/simulados", icon: GraduationCap, profiles: ["concurseiro", "tudo"] },
        { title: "Flashcards", url: "/flashcards", icon: Brain, profiles: ["concurseiro", "universitario", "tudo"] },
        { title: "Jogos Jurídicos", url: "/jogos", icon: Trophy, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Redação Jurídica", url: "/redacao-juridica", icon: FileText, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Peticionário", url: "/peticoes", icon: FilePlus, profiles: ["advogado", "tudo"] },
        { title: "Jurisprudência", url: "/jurisprudencia", icon: Gavel, profiles: ["concurseiro", "advogado", "tudo"] },
        { title: "Notícias", url: "/noticias", icon: Newspaper, profiles: ["advogado", "tudo"] },
        { title: "Assistente Jurídico", url: "/assistente", icon: MessageSquare, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
        { title: "Anotações", url: "/anotacoes", icon: PenTool, profiles: ["concurseiro", "universitario", "tudo"] },
      ]
    },
    {
      label: "Outros",
      items: [
        { title: "Cronograma", url: "/cronograma", icon: Calendar, profiles: ["concurseiro", "universitario", "tudo"] },
        { title: "Gamificação", url: "/gamificacao", icon: Trophy, profiles: ["concurseiro", "universitario", "tudo"] },
        { title: "Remote Desktop", url: "/remote", icon: MonitorPlay, profiles: ["tudo"] },
        { title: "Perfil", url: "/perfil", icon: User, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
      ]
    },
  ];
  
  // Filter menu items based on user profile
  const filteredMenuCategories = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item => item.profiles.includes(userProfile))
  })).filter(category => category.items.length > 0);

  // Define profile configurations for header display
  const profileConfig = {
    concurseiro: {
      title: "Perfil Concurseiro",
      description: "Foco em concursos públicos jurídicos",
      icon: GraduationCap
    },
    universitario: {
      title: "Perfil Universitário",
      description: "Estudante de direito em graduação",
      icon: GraduationCap
    },
    advogado: {
      title: "Perfil Advogado",
      description: "Profissional em exercício",
      icon: Scale
    },
    tudo: {
      title: "Acesso Completo",
      description: "Todos os recursos disponíveis",
      icon: Home
    }
  };

  const { title, description, icon: ProfileIcon } = profileConfig[userProfile];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center">
        <div className="flex items-center gap-2 ml-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Direito 360</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-4 px-3 py-2">
            <div className="bg-primary/10 text-primary rounded-md p-3 transition-all hover:bg-primary/15">
              <div className="flex items-center mb-2">
                <ProfileIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </SidebarGroup>
        
        {filteredMenuCategories.map((category, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => {
                  const isActive = location.pathname === item.url || 
                                  (item.url !== "/" && location.pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a 
                          href={item.url} 
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md min-h-[44px] transition-colors",
                            isActive 
                              ? "bg-primary/20 text-primary font-medium" 
                              : "hover:bg-accent/50 hover:text-accent-foreground"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
                          <span>{item.title}</span>
                          {item.isNew && (
                            <Badge variant="secondary" className="ml-auto text-[10px] py-0">
                              NOVO
                            </Badge>
                          )}
                          {'isPremium' in item && item.isPremium && (
                            <Badge variant="outline" className="ml-auto text-[10px] py-0 bg-amber-500/20 text-amber-500 border-amber-500/30">
                              PRO
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center justify-between px-4">
          <span className="text-xs text-muted-foreground">v1.2.0</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
