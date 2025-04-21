
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
import AuthPage from "./pages/Auth";
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

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
    localStorage.setItem("juris-study-profile", profile);
  };

  const [session, setSession] = useState(null);
  useEffect(() => {
    // Listen auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Redireciona para autenticação se não logado e rota diferente de /auth
  const isAuthPage = window.location.pathname.startsWith("/auth");
  if (!session && !isAuthPage) {
    window.location.href = "/auth";
    return null;
  }
  if (session && isAuthPage) {
    window.location.href = "/";
    return null;
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
              {/* Auth route */}
              <Route path="/auth" element={<AuthPage />} />
              {/* Main routes */}
              <Route path="/" element={<Layout userProfile={userProfile}><Index /></Layout>} />
              <Route path="/videoaulas" element={<Layout userProfile={userProfile}><VideoAulas /></Layout>} />
              <Route path="/bloger" element={<Layout userProfile={userProfile}><Bloger /></Layout>} />
              <Route path="/anotacoes" element={<Layout userProfile={userProfile}><Anotacoes /></Layout>} />
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
