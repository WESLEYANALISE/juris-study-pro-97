
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
import DicionarioJuridico from "./pages/DicionarioJuridico";
import Auth from "./components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

// Add style for page transitions
const globalStyles = `
.page-transition {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-exit {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter {
  opacity: 0;
  transform: translateY(-10px);
  animation: page-enter-animation 0.3s forwards;
}
@keyframes page-enter-animation {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileType>(() => {
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });

  useEffect(() => {
    // Add global styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    checkSession();

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
    localStorage.setItem("juris-study-profile", profile);
  };

  // If no user is logged in, show Auth page
  if (!user) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="juris-study-theme">
        <Auth />
      </ThemeProvider>
    );
  }

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
              <Route path="/biblioteca" element={<Layout userProfile={userProfile}><Biblioteca /></Layout>} />
              <Route path="/explorar" element={<Layout userProfile={userProfile}><Explorar /></Layout>} />
              <Route path="/ferramentas-juridicas" element={<Layout userProfile={userProfile}><FerramentasJuridicas /></Layout>} />
              <Route path="/flashcards" element={<Layout userProfile={userProfile}><Flashcards /></Layout>} />
              <Route path="/ferramentas/dicionario" element={<Layout userProfile={userProfile}><DicionarioJuridico /></Layout>} />
              
              {/* Placeholder routes until these pages are created */}
              <Route path="/resumos" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/simulados" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/peticionario" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/jurisprudencia" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/noticias" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/assistente" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/perfil" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/search" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/remote-desktop" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              
              {/* Ferramentas Jurídicas sub-routes */}
              <Route path="/ferramentas/vademecum" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/ferramentas/modelos" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/ferramentas/cronograma" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              
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
