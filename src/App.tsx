
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import VideoAulas from "./pages/VideoAulas";
import NotFound from "./pages/NotFound";
import { WelcomeModal, type ProfileType } from "./components/WelcomeModal";
import Bloger from "./pages/Bloger";
import Anotacoes from "./pages/Anotacoes";
import Biblioteca from "./pages/Biblioteca";
import Explorar from "./pages/Explorar";
import FerramentasJuridicas from "./pages/FerramentasJuridicas";
import Flashcards from "./pages/Flashcards";
import Jurisprudencia from "./pages/Jurisprudencia";
import Resumos from "./pages/Resumos";
import Simulados from "./pages/Simulados";
import Peticionario from "./pages/Peticionario";
import Noticias from "./pages/Noticias";
import Assistente from "./pages/Assistente";
import Perfil from "./pages/Perfil";
import Search from "./pages/Search";
import RemoteDesktop from "./pages/RemoteDesktop";
import Vademecum from "./pages/ferramentas/Vademecum";
import Dicionario from "./pages/ferramentas/Dicionario";
import Modelos from "./pages/ferramentas/Modelos";
import Cronograma from "./pages/ferramentas/Cronograma";
import Auth from "./pages/Auth";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [userProfile, setUserProfile] = useState<ProfileType>(() => {
    // Recuperar o perfil do localStorage, ou usar 'tudo' como padrão
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouvir mudanças no estado da autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
    localStorage.setItem("juris-study-profile", profile);
  };

  // Componente de rota protegida que redireciona para /auth se não estiver autenticado
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!session) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="juris-study-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WelcomeModal onProfileSelect={handleProfileSelect} />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Index /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/videoaulas" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><VideoAulas /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/bloger" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Bloger /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/anotacoes" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Anotacoes /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/biblioteca" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Biblioteca /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/explorar" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Explorar /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/ferramentas-juridicas" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><FerramentasJuridicas /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/flashcards" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Flashcards /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/jurisprudencia" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Jurisprudencia /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/resumos" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Resumos /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/simulados" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Simulados /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/peticionario" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Peticionario /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/noticias" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Noticias /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/assistente" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Assistente /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Perfil /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Search /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/remote-desktop" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><RemoteDesktop /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Ferramentas Jurídicas sub-routes */}
              <Route path="/ferramentas/vademecum" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Vademecum /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/ferramentas/dicionario" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Dicionario /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/ferramentas/modelos" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Modelos /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/ferramentas/cronograma" element={
                <ProtectedRoute>
                  <Layout userProfile={userProfile}><Cronograma /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Redirect routes */}
              <Route path="/videoaulas.html" element={<Navigate to="/videoaulas" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
