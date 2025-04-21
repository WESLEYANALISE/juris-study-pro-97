
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

function App() {
  const [userProfile, setUserProfile] = useState<ProfileType>(() => {
    // Recuperar o perfil do localStorage, ou usar 'tudo' como padrão
    return (localStorage.getItem("juris-study-profile") as ProfileType) || "tudo";
  });

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
    localStorage.setItem("juris-study-profile", profile);
  };

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Enquanto carrega, não mostre nada
  if (loading) {
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
              <Route 
                path="/auth" 
                element={session ? <Navigate to="/" replace /> : <AuthPage />} 
              />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  session ? (
                    <Layout userProfile={userProfile}><Index /></Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              <Route 
                path="/videoaulas" 
                element={
                  session ? (
                    <Layout userProfile={userProfile}><VideoAulas /></Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              <Route 
                path="/bloger" 
                element={
                  session ? (
                    <Layout userProfile={userProfile}><Bloger /></Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              <Route 
                path="/anotacoes" 
                element={
                  session ? (
                    <Layout userProfile={userProfile}><Anotacoes /></Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              
              {/* Redirect routes */}
              <Route 
                path="/videoaulas.html" 
                element={<Navigate to="/videoaulas" replace />} 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

