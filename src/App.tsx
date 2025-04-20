
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
            <Routes>
              <Route path="/" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/videoaulas" element={<Layout userProfile={userProfile}><VideoAulas /></Layout>} />
              <Route path="/bloger" element={<Layout userProfile={userProfile}><Bloger /></Layout>} />
              <Route path="/anotacoes" element={<Layout userProfile={userProfile}><Anotacoes /></Layout>} />
              <Route path="/biblioteca" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/flashcards" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/resumos" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/simulados" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/peticionario" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/jurisprudencia" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/noticias" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/remote-desktop" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/assistente" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/explorar" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/perfil" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/search" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              
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
