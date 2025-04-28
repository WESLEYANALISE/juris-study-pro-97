import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useState, useEffect } from "react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import JurisFlix from "@/pages/JurisFlix";
import Dicionario from "@/pages/Dicionario";
import Biblioteca from "@/pages/Biblioteca";
import BibliotecaRecomendacoes from "@/pages/BibliotecaRecomendacoes";
import Questoes from "@/pages/Questoes";
import VadeMecum from "@/pages/VadeMecum";
import VadeMecumViewer from "@/pages/VadeMecumViewer";
import Simulados from "@/pages/Simulados";
import SimuladoSessao from "@/pages/SimuladoSessao";
import SimuladoResultado from "@/pages/SimuladoResultado";
import Flashcards from "@/pages/Flashcards";
import MapasMentais from "@/pages/MapasMentais";
import Noticias from "@/pages/Noticias";
import Peticoes from "@/pages/Peticoes";
import AssistenteJuridico from "@/pages/AssistenteJuridico";
import Perfil from "@/pages/Perfil";
import IniciandoNoDireito from "@/pages/IniciandoNoDireito";
import NotFound from "@/pages/NotFound";
import VerTudo from "@/pages/VerTudo";
import Cursos from "@/pages/Cursos";
import CursoViewer from "@/pages/CursoViewer";
import RedacaoJuridica from "@/pages/RedacaoJuridica";
import RedacaoConteudo from "@/pages/RedacaoConteudo";
import VideoAulas from "@/pages/VideoAulas";
import VideoAulasTradicional from "@/pages/VideoAulasTradicional";
import VideoAulasInterativas from "./pages/VideoAulasInterativas";
import Anotacoes from "@/pages/Anotacoes";
import { type ProfileType } from "@/components/WelcomeModal";
import { WelcomeModal } from "@/components/WelcomeModal";

function App() {
  const [userProfile, setUserProfile] = useState<ProfileType>("tudo");

  useEffect(() => {
    // Load saved profile from localStorage if available
    const savedProfile = localStorage.getItem("juris-study-profile") as ProfileType | null;
    if (savedProfile && ["concurseiro", "universitario", "advogado", "tudo"].includes(savedProfile)) {
      setUserProfile(savedProfile as ProfileType);
    }
  }, []);

  const handleProfileSelect = (profile: ProfileType) => {
    setUserProfile(profile);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="juspedia-theme">
      <WelcomeModal onProfileSelect={handleProfileSelect} />
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout userProfile={userProfile}>{<Index />}</Layout>} />
          <Route path="/inicie" element={<RequireAuth><Layout userProfile={userProfile}>{<IniciandoNoDireito />}</Layout></RequireAuth>} />
          <Route path="/jurisflix" element={<Layout userProfile={userProfile}>{<JurisFlix />}</Layout>} />
          <Route path="/dicionario" element={<Layout userProfile={userProfile}>{<Dicionario />}</Layout>} />
          <Route path="/biblioteca" element={<Layout userProfile={userProfile}>{<Biblioteca />}</Layout>} />
          <Route path="/biblioteca/recomendacoes" element={<Layout userProfile={userProfile}>{<BibliotecaRecomendacoes />}</Layout>} />
          <Route path="/questoes" element={<RequireAuth><Layout userProfile={userProfile}>{<Questoes />}</Layout></RequireAuth>} />
          <Route path="/vademecum" element={<Layout userProfile={userProfile}>{<VadeMecum />}</Layout>} />
          <Route path="/vademecum/:lawId" element={<Layout userProfile={userProfile}>{<VadeMecumViewer />}</Layout>} />
          <Route path="/vademecum/:lawId/:articleId" element={<Layout userProfile={userProfile}>{<VadeMecumViewer />}</Layout>} />
          <Route path="/simulados" element={<RequireAuth><Layout userProfile={userProfile}>{<Simulados />}</Layout></RequireAuth>} />
          <Route path="/simulados/:sessaoId" element={<RequireAuth><Layout userProfile={userProfile}>{<SimuladoSessao />}</Layout></RequireAuth>} />
          <Route path="/simulados/resultado/:sessaoId" element={<RequireAuth><Layout userProfile={userProfile}>{<SimuladoResultado />}</Layout></RequireAuth>} />
          <Route path="/flashcards" element={<RequireAuth><Layout userProfile={userProfile}>{<Flashcards />}</Layout></RequireAuth>} />
          <Route path="/mapas-mentais" element={<Layout userProfile={userProfile}>{<MapasMentais />}</Layout>} />
          <Route path="/noticias" element={<Layout userProfile={userProfile}>{<Noticias />}</Layout>} />
          <Route path="/peticoes" element={<Layout userProfile={userProfile}>{<Peticoes />}</Layout>} />
          <Route path="/assistente" element={<RequireAuth><Layout userProfile={userProfile}>{<AssistenteJuridico />}</Layout></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Layout userProfile={userProfile}>{<Perfil />}</Layout></RequireAuth>} />
          <Route path="/vermais/:categoria" element={<Layout userProfile={userProfile}>{<VerTudo />}</Layout>} />
          <Route path="/cursos" element={<Layout userProfile={userProfile}>{<Cursos />}</Layout>} />
          <Route path="/curso/:cursoId" element={<RequireAuth><Layout userProfile={userProfile}>{<CursoViewer />}</Layout></RequireAuth>} />
          <Route path="/redacao-juridica" element={<Layout userProfile={userProfile}>{<RedacaoJuridica />}</Layout>} />
          <Route path="/redacao-conteudo/:id?" element={<Layout userProfile={userProfile}>{<RedacaoConteudo />}</Layout>} />
          <Route path="/videoaulas" element={<Layout userProfile={userProfile}>{<VideoAulas />}</Layout>} />
          <Route path="/videoaulas/tradicionais" element={<Layout userProfile={userProfile}>{<VideoAulasTradicional />}</Layout>} />
          <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
          <Route path="/anotacoes" element={<RequireAuth><Layout userProfile={userProfile}>{<Anotacoes />}</Layout></RequireAuth>} />
          <Route path="*" element={<Layout userProfile={userProfile}>{<NotFound />}</Layout>} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
