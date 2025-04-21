
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileNavigation from "@/components/MobileNavigation";
import RecentAccess from "@/components/RecentAccess";
import { useLocation } from "react-router-dom";
import { Suspense } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion";

// Simple error fallback component
const ErrorFallback = () => (
  <div className="p-4 bg-red-50 text-red-500 rounded-md">
    Ocorreu um erro ao carregar este componente.
  </div>
);

// Simple loading fallback
const LoadingFallback = () => (
  <div className="p-4 text-center">
    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-primary"></div>
    <p className="mt-2 text-sm">Carregando...</p>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  userProfile: ProfileType;
}

const Layout = ({ children, userProfile }: LayoutProps) => {
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
    if (path === "/ferramentas-juridicas") return "Ferramentas Jurídicas";
    if (path === "/assistente") return "Assistente AI";
    if (path === "/perfil") return "Meu Perfil";
    return null;
  };
  
  const pageTitle = getCurrentPageTitle();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} pageTitle={pageTitle} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <motion.main 
            className="flex-1 p-0 md:p-6 overflow-auto pb-20 md:pb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isHomePage && (
              <div className="w-full md:max-w-4xl mx-auto">
                <Suspense fallback={<LoadingFallback />}>
                  <ReactErrorBoundary FallbackComponent={ErrorFallback}>
                    <RecentAccess />
                  </ReactErrorBoundary>
                </Suspense>
              </div>
            )}
            <Suspense fallback={<LoadingFallback />}>
              <ReactErrorBoundary FallbackComponent={ErrorFallback}>
                {children}
              </ReactErrorBoundary>
            </Suspense>
          </motion.main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
