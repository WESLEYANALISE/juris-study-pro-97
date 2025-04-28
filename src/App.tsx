import { useState } from "react";
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
import Auth from "./pages/Auth";
import { RequireAuth } from "@/components/RequireAuth";
import Biblioteca from "./pages/Biblioteca";
import BibliotecaRecomendacoes from "./pages/BibliotecaRecomendacoes";
import Flashcards from "./pages/Flashcards";
import { DataMigrationAlert } from "./components/DataMigrationAlert";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import VerTudo from "./pages/VerTudo";
import Perfil from "./pages/Perfil";
import Noticias from "./pages/Noticias";
import Dicionario from "./pages/Dicionario";
import JurisFlix from "./pages/JurisFlix";
import Questoes from "./pages/Questoes";
import Peticoes from "./pages/Peticoes";
import MapasMentais from "./pages/MapasMentais";
import VadeMecum from "./pages/VadeMecum";
import VadeMecumViewer from "./pages/VadeMecumViewer";
import AssistenteJuridico from "./pages/AssistenteJuridico";
import Simulados from "./pages/Simulados";
import SimuladoSessao from "./pages/SimuladoSessao";
import SimuladoResultado from "./pages/SimuladoResultado";
import IniciandoNoDireito from "./pages/IniciandoNoDireito";
import Cursos from "./pages/Cursos";
import CursoViewer from "./pages/CursoViewer";

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
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
    localStorage.setItem("juris-study-profile", profile);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="juris-study-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WelcomeModal onProfileSelect={handleProfileSelect} />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <DataMigrationAlert />
                          <Index />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                
                <Route
                  path="/iniciando-no-direito"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <IniciandoNoDireito />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                
                <Route
                  path="/cursos"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Cursos />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/cursos/:id"
                  element={
                    <RequireAuth>
                      <CursoViewer />
                    </RequireAuth>
                  }
                />
                
                <Route
                  path="/biblioteca"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <DataMigrationAlert />
                          <Biblioteca />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/biblioteca/recomendacoes"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <BibliotecaRecomendacoes />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/flashcards"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <DataMigrationAlert />
                          <Flashcards />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/videoaulas"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <VideoAulas />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/bloger"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Bloger />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/anotacoes"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Anotacoes />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/ver-tudo"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <VerTudo />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Perfil />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/noticias"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Noticias />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/questoes"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Questoes />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route path="/videoaulas.html" element={<Navigate to="/videoaulas" replace />} />
                <Route
                  path="/dicionario"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Dicionario />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/jurisflix"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <JurisFlix />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/peticionario"
                  element={<Navigate to="/peticoes" replace />}
                />
                <Route
                  path="/peticoes"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Peticoes />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/mapas-mentais"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <MapasMentais />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/vademecum"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <VadeMecum />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/vademecum/:tableName"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <VadeMecumViewer />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/assistente"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <AssistenteJuridico />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                
                <Route
                  path="/simulados"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <Simulados />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/simulados/sessao/:id"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <SimuladoSessao />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/simulados/resultado/:id"
                  element={
                    <RequireAuth>
                      <Layout userProfile={userProfile}>
                        <PageTransition>
                          <SimuladoResultado />
                        </PageTransition>
                      </Layout>
                    </RequireAuth>
                  }
                />
                
                <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
