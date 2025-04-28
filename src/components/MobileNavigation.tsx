
import * as React from "react";
import { Home, BookOpenText, Video, GraduationCap, Brain, FileText, FilePlus, MessageSquare, Library, BookOpen, Film, Newspaper, Gavel, PenTool, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

// Define os itens do menu de navegação móvel
const navItems = [
  { name: "Início", href: "/", icon: Home },
  { name: "Cursos", href: "/cursos", icon: BookOpenText },
  { name: "Vídeos", href: "/videoaulas", icon: Video },
  { name: "Estudar", href: "/questoes", icon: Brain },
  { name: "Perfil", href: "/perfil", icon: User }
];

// Componente de navegação para dispositivos móveis
export default function MobileNavigation() {
  const location = useLocation();
  const { state } = useSidebar();
  
  // Não renderizar a navegação móvel se o sidebar estiver expandido
  // Isso evita duplicação de menus quando o sidebar já está sendo mostrado em tela
  if (state === 'expanded') {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-2 md:hidden">
      <ul className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (location.pathname !== "/" && item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "flex flex-col items-center px-2 py-1 text-xs",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
