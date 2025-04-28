
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
import { WelcomeModal } from "@/components/WelcomeModal";
import { type ProfileType } from "@/components/WelcomeModal";

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
        <RequireAuth>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout userProfile={userProfile}><Index /></Layout>} />
            <Route path="/inicie" element={<Layout userProfile={userProfile}><IniciandoNoDireito /></Layout>} />
            <Route path="/jurisflix" element={<Layout userProfile={userProfile}><JurisFlix /></Layout>} />
            <Route path="/dicionario" element={<Layout userProfile={userProfile}><Dicionario /></Layout>} />
            <Route path="/biblioteca" element={<Layout userProfile={userProfile}><Biblioteca /></Layout>} />
            <Route path="/biblioteca/recomendacoes" element={<Layout userProfile={userProfile}><BibliotecaRecomendacoes /></Layout>} />
            <Route path="/questoes" element={<Layout userProfile={userProfile}><Questoes /></Layout>} />
            <Route path="/vademecum" element={<Layout userProfile={userProfile}><VadeMecum /></Layout>} />
            <Route path="/vademecum/:lawId" element={<Layout userProfile={userProfile}><VadeMecumViewer /></Layout>} />
            <Route path="/vademecum/:lawId/:articleId" element={<Layout userProfile={userProfile}><VadeMecumViewer /></Layout>} />
            <Route path="/simulados" element={<Layout userProfile={userProfile}><Simulados /></Layout>} />
            <Route path="/simulados/:sessaoId" element={<Layout userProfile={userProfile}><SimuladoSessao /></Layout>} />
            <Route path="/simulados/resultado/:sessaoId" element={<Layout userProfile={userProfile}><SimuladoResultado /></Layout>} />
            <Route path="/flashcards" element={<Layout userProfile={userProfile}><Flashcards /></Layout>} />
            <Route path="/mapas-mentais" element={<Layout userProfile={userProfile}><MapasMentais /></Layout>} />
            <Route path="/noticias" element={<Layout userProfile={userProfile}><Noticias /></Layout>} />
            <Route path="/peticoes" element={<Layout userProfile={userProfile}><Peticoes /></Layout>} />
            <Route path="/assistente" element={<Layout userProfile={userProfile}><AssistenteJuridico /></Layout>} />
            <Route path="/perfil" element={<Layout userProfile={userProfile}><Perfil /></Layout>} />
            <Route path="/vermais/:categoria" element={<Layout userProfile={userProfile}><VerTudo /></Layout>} />
            <Route path="/cursos" element={<Layout userProfile={userProfile}><Cursos /></Layout>} />
            <Route path="/curso/:cursoId" element={<Layout userProfile={userProfile}><CursoViewer /></Layout>} />
            <Route path="/redacao-juridica" element={<Layout userProfile={userProfile}><RedacaoJuridica /></Layout>} />
            <Route path="/redacao-conteudo/:id?" element={<Layout userProfile={userProfile}><RedacaoConteudo /></Layout>} />
            <Route path="/videoaulas" element={<Layout userProfile={userProfile}><VideoAulas /></Layout>} />
            <Route path="/videoaulas/tradicionais" element={<Layout userProfile={userProfile}><VideoAulasTradicional /></Layout>} />
            <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
            <Route path="/anotacoes" element={<Layout userProfile={userProfile}><Anotacoes /></Layout>} />
            <Route path="*" element={<Layout userProfile={userProfile}><NotFound /></Layout>} />
          </Routes>
        </RequireAuth>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
