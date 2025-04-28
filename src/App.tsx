
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { AuthProvider } from "@/hooks/use-auth";
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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="juspedia-theme">
      <AuthProvider>
        <Router>
          <RequireAuth>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/inicie" element={<Layout><IniciandoNoDireito /></Layout>} />
              <Route path="/jurisflix" element={<Layout><JurisFlix /></Layout>} />
              <Route path="/dicionario" element={<Layout><Dicionario /></Layout>} />
              <Route path="/biblioteca" element={<Layout><Biblioteca /></Layout>} />
              <Route path="/biblioteca/recomendacoes" element={<Layout><BibliotecaRecomendacoes /></Layout>} />
              <Route path="/questoes" element={<Layout><Questoes /></Layout>} />
              <Route path="/vademecum" element={<Layout><VadeMecum /></Layout>} />
              <Route path="/vademecum/:lawId" element={<Layout><VadeMecumViewer /></Layout>} />
              <Route path="/vademecum/:lawId/:articleId" element={<Layout><VadeMecumViewer /></Layout>} />
              <Route path="/simulados" element={<Layout><Simulados /></Layout>} />
              <Route path="/simulados/:sessaoId" element={<Layout><SimuladoSessao /></Layout>} />
              <Route path="/simulados/resultado/:sessaoId" element={<Layout><SimuladoResultado /></Layout>} />
              <Route path="/flashcards" element={<Layout><Flashcards /></Layout>} />
              <Route path="/mapas-mentais" element={<Layout><MapasMentais /></Layout>} />
              <Route path="/noticias" element={<Layout><Noticias /></Layout>} />
              <Route path="/peticoes" element={<Layout><Peticoes /></Layout>} />
              <Route path="/assistente" element={<Layout><AssistenteJuridico /></Layout>} />
              <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
              <Route path="/vermais/:categoria" element={<Layout><VerTudo /></Layout>} />
              <Route path="/cursos" element={<Layout><Cursos /></Layout>} />
              <Route path="/curso/:cursoId" element={<Layout><CursoViewer /></Layout>} />
              <Route path="/redacao-juridica" element={<Layout><RedacaoJuridica /></Layout>} />
              <Route path="/redacao-conteudo/:id?" element={<Layout><RedacaoConteudo /></Layout>} />
              <Route path="/videoaulas" element={<Layout><VideoAulas /></Layout>} />
              <Route path="/videoaulas/tradicionais" element={<Layout><VideoAulasTradicional /></Layout>} />
              <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
              <Route path="/anotacoes" element={<Layout><Anotacoes /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </RequireAuth>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
