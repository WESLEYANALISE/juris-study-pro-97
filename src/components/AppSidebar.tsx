
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
  
  // Menu items para navegação principal
  const allMenuItems = [
    { title: "Início", url: "/", icon: Home, profiles: ["concurseiro", "universitario", "advogado", "oab", "tudo"] },
    { title: "Vídeo-aulas", url: "/videoaulas", icon: Video, profiles: ["concurseiro", "universitario", "advogado", "oab", "tudo"] },
    { title: "Biblioteca", url: "/biblioteca", icon: Library, profiles: ["concurseiro", "universitario", "advogado", "oab", "tudo"] },
    { title: "Vade-Mecum", url: "/vademecum", icon: BookOpen, profiles: ["concurseiro", "universitario", "advogado", "oab", "tudo"] },
    { title: "Dicionário", url: "/dicionario", icon: BookOpen, profiles: ["universitario", "advogado", "oab", "tudo"] },
    { title: "Resumos", url: "/resumos", icon: Brain, profiles: ["concurseiro", "universitario", "oab", "tudo"] },
    { title: "Simulados", url: "/simulados", icon: GraduationCap, profiles: ["concurseiro", "oab", "tudo"] },
    { title: "Flashcards", url: "/flashcards", icon: Brain, profiles: ["concurseiro", "universitario", "oab", "tudo"] },
    { title: "Peticionário", url: "/peticionario", icon: FilePlus, profiles: ["advogado", "oab", "tudo"] },
    { title: "Jurisprudência", url: "/jurisprudencia", icon: Gavel, profiles: ["concurseiro", "advogado", "oab", "tudo"] },
    { title: "Notícias", url: "/noticias", icon: Newspaper, profiles: ["advogado", "oab", "tudo"] },
    { title: "Assistente", url: "/assistente", icon: MessageSquare, profiles: ["concurseiro", "universitario", "advogado", "oab", "tudo"] },
    { title: "Cronograma", url: "/cronograma", icon: Calendar, profiles: ["concurseiro", "universitario", "oab", "tudo"] },
    { title: "Gamificação", url: "/gamificacao", icon: Trophy, profiles: ["concurseiro", "universitario", "oab", "tudo"] },
    { title: "Remote Desktop", url: "/remote", icon: MonitorPlay, profiles: ["tudo"] },
  ];
  
  // Filtrar itens do menu com base no perfil do usuário
  const mainMenuItems = allMenuItems.filter(item => 
    item.profiles.includes(userProfile)
  );

  // Definições de perfil para exibir no cabeçalho
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
    oab: {
      title: "Perfil OAB",
      description: "Preparação específica para Exame da Ordem",
      icon: BookOpen
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
