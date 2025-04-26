
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
import Flashcards from "./pages/Flashcards";
import { DataMigrationAlert } from "./components/DataMigrationAlert";

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
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}>
                      <DataMigrationAlert />
                      <Index />
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/biblioteca"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}>
                      <DataMigrationAlert />
                      <Biblioteca />
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/flashcards"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}>
                      <DataMigrationAlert />
                      <Flashcards />
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/videoaulas"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}><VideoAulas /></Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/bloger"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}><Bloger /></Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/anotacoes"
                element={
                  <RequireAuth>
                    <Layout userProfile={userProfile}><Anotacoes /></Layout>
                  </RequireAuth>
                }
              />
              <Route path="/videoaulas.html" element={<Navigate to="/videoaulas" replace />} />
              <Route
                path="*"
                element={
                  <RequireAuth>
                    <NotFound />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
