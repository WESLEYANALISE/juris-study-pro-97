
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileNavigation from "@/components/MobileNavigation";
import { useLocation } from "react-router-dom";
import { Suspense } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

// Simple error fallback component
const ErrorFallback = () => <div className="p-4 bg-red-50 text-red-500 rounded-md">
    Ocorreu um erro ao carregar este componente.
  </div>;

// Simple loading fallback
const LoadingFallback = () => <div className="p-4 text-center">Carregando...</div>;

interface LayoutProps {
  children: React.ReactNode;
  userProfile: ProfileType;
  onProfileChange?: (profile: ProfileType) => void;
}

const Layout = ({
  children,
  userProfile,
  onProfileChange
}: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Get current page title based on route
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === "/biblioteca") return "Biblioteca Jurídica";
    if (path === "/jurisprudencia") return "Jurisprudência";
    if (path === "/flashcards") return "Flashcards";
    if (path === "/videoaulas") return "Vídeo Aulas";
    if (path === "/anotacoes") return "Anotações";
    if (path === "/resumos") return "Resumos";
    if (path === "/simulados") return "Simulados";
    if (path === "/ferramentas") return "Ferramentas Jurídicas";
    if (path === "/assistente") return "Assistente AI";
    if (path === "/perfil") return "Meu Perfil";
    return null;
  };
  
  const pageTitle = getCurrentPageTitle();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} pageTitle={pageTitle} onProfileChange={onProfileChange} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 p-3 md:p-6 overflow-auto pb-20 md:pb-6 px-0 py-0 my-0 mx-0">
            <Suspense fallback={<LoadingFallback />}>
              <ReactErrorBoundary FallbackComponent={ErrorFallback}>
                {children}
              </ReactErrorBoundary>
            </Suspense>
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
