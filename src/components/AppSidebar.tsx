import { Calendar, BookOpen, GraduationCap, Scale, Home, Video, Brain, FilePlus, Gavel, Newspaper, MessageSquare, Library, Trophy, MonitorPlay } from "lucide-react";
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

interface AppSidebarProps {
  userProfile: ProfileType;
}

export function AppSidebar({ userProfile }: AppSidebarProps) {
  const location = useLocation();
  
  // Menu items for main navigation
  const menuItems = [
    { title: "Início", url: "/", icon: Home, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Vídeo-aulas", url: "/videoaulas", icon: Video, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Biblioteca", url: "/biblioteca", icon: Library, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Vade-Mecum", url: "/vademecum", icon: BookOpen, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Dicionário", url: "/dicionario", icon: BookOpen, profiles: ["universitario", "advogado", "tudo"] },
    { title: "Mapas Mentais", url: "/mapas-mentais", icon: Brain, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Resumos", url: "/resumos", icon: Brain, profiles: ["concurseiro", "universitario", "tudo"] },
    { title: "Simulados", url: "/simulados", icon: GraduationCap, profiles: ["concurseiro", "tudo"] },
    { title: "Flashcards", url: "/flashcards", icon: Brain, profiles: ["concurseiro", "universitario", "tudo"] },
    { title: "Peticionário", url: "/peticoes", icon: FilePlus, profiles: ["advogado", "tudo"] },
    { title: "Jurisprudência", url: "/jurisprudencia", icon: Gavel, profiles: ["concurseiro", "advogado", "tudo"] },
    { title: "Notícias", url: "/noticias", icon: Newspaper, profiles: ["advogado", "tudo"] },
    { title: "Assistente Jurídico", url: "/assistente", icon: MessageSquare, profiles: ["concurseiro", "universitario", "advogado", "tudo"] },
    { title: "Cronograma", url: "/cronograma", icon: Calendar, profiles: ["concurseiro", "universitario", "tudo"] },
    { title: "Gamificação", url: "/gamificacao", icon: Trophy, profiles: ["concurseiro", "universitario", "tudo"] },
    { title: "Remote Desktop", url: "/remote", icon: MonitorPlay, profiles: ["tudo"] },
  ];
  
  // Filter menu items based on user profile
  const mainMenuItems = menuItems.filter(item => 
    item.profiles.includes(userProfile)
  );

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
          <span className="font-bold text-xl">JurisStudy</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-4 px-3 py-2">
            <div className="bg-primary/10 text-primary rounded-md p-3">
              <div className="flex items-center mb-2">
                <ProfileIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a 
                        href={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                          isActive ? "bg-primary/20 text-primary font-medium" : "hover:bg-sidebar-accent/50"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
