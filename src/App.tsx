
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Podcasts from "@/pages/Podcasts";
import Dicionario from "@/pages/Dicionario";
// Old library component completely removed
import BibliotecaJuridica from "@/pages/BibliotecaJuridica";
import BibliotecaRecomendacoes from "@/pages/BibliotecaRecomendacoes";
import Questoes from "@/pages/Questoes";
import VadeMecum from "@/pages/VadeMecum";
import VadeMecumViewer from "@/pages/VadeMecumViewer";
import VadeMecumFavorites from "@/pages/VadeMecumFavorites"; 
import Simulados from "@/pages/Simulados";
import SimuladoCategoria from "@/pages/SimuladoCategoria";
import SimuladoSessao from "@/pages/SimuladoSessao";
import SimuladoResultado from "@/pages/SimuladoResultado";
import Flashcards from "@/pages/Flashcards";
import MapasMentais from "@/pages/MapasMentais";
import Peticoes from "@/pages/Peticoes";
import AssistenteJuridico from "@/pages/AssistenteJuridico";
import Perfil from "@/pages/Perfil";
import IniciandoNoDireito from "@/pages/IniciandoNoDireito";
import PDFLinksPage from "@/pages/PDFLinksPage";
import Livro9Page from "@/pages/Livro9Page";
import NotFound from "@/pages/NotFound";
import VerTudo from "@/pages/VerTudo";
import Cursos from "@/pages/Cursos";
import CursoViewer from "@/pages/CursoViewer";
import RedacaoJuridica from "@/pages/RedacaoJuridica";
import RedacaoConteudo from "@/pages/RedacaoConteudo";
import VideoAulas from "@/pages/VideoAulas";
import VideoAulasTradicional from "@/pages/VideoAulasTradicional";
import VideoAulasInterativas from "./pages/VideoAulasInterativas";
import VideoAulasRecomendacoes from "./pages/VideoAulasRecomendacoes";
import Anotacoes from "@/pages/Anotacoes";
import JogosJuridicos from "@/pages/JogosJuridicos";
import JogoDetalhes from "@/pages/JogoDetalhes";
import JurisFlix from "@/pages/JurisFlix";

function App() {
  return (
    <ThemeProvider storageKey="juspedia-theme">
      <AuthProvider>
        <Router>
          <RequireAuth>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/inicie" element={<Layout><IniciandoNoDireito /></Layout>} />
              <Route path="/podcasts" element={<Layout><Podcasts /></Layout>} />
              <Route path="/dicionario" element={<Layout><Dicionario /></Layout>} />
              
              {/* BibliotecaJuridica as default library */}
              <Route path="/biblioteca" element={<Navigate to="/biblioteca-juridica" replace />} />
              <Route path="/biblioteca-juridica" element={<Layout><BibliotecaJuridica /></Layout>} />
              <Route path="/biblioteca/recomendacoes" element={<Layout><BibliotecaRecomendacoes /></Layout>} />
              
              {/* New PDF Links and Livro9 pages */}
              <Route path="/pdf-links" element={<Layout><PDFLinksPage /></Layout>} />
              <Route path="/livro9" element={<Layout><Livro9Page /></Layout>} />
              
              <Route path="/questoes" element={<Layout><Questoes /></Layout>} />
              <Route path="/vademecum" element={<Layout><VadeMecum /></Layout>} />
              <Route path="/vademecum/:lawId" element={<Layout><VadeMecumViewer /></Layout>} />
              <Route path="/vademecum/favoritos" element={<Layout><VadeMecumFavorites /></Layout>} />
              <Route path="/vademecum/:lawId/:articleId" element={<Layout><VadeMecumViewer /></Layout>} />
              <Route path="/simulados" element={<Layout><Simulados /></Layout>} />
              <Route path="/simulados/:categoria" element={<Layout><SimuladoCategoria /></Layout>} />
              <Route path="/simulados/:categoria/sessao/:sessaoId" element={<Layout><SimuladoSessao /></Layout>} />
              <Route path="/simulados/resultado/:sessaoId" element={<Layout><SimuladoResultado /></Layout>} />
              <Route path="/flashcards" element={<Layout><Flashcards /></Layout>} />
              <Route path="/mapas-mentais" element={<Layout><MapasMentais /></Layout>} />
              {/* Removed Noticias route as requested */}
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
              <Route path="/videoaulas/recomendacoes" element={<Layout><VideoAulasRecomendacoes /></Layout>} />
              <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
              <Route path="/anotacoes" element={<Layout><Anotacoes /></Layout>} />
              {/* Kept JogosJuridicos but removed gamification */}
              <Route path="/jogos" element={<Layout><JogosJuridicos /></Layout>} />
              <Route path="/jogos/:jogoId" element={<Layout><JogoDetalhes /></Layout>} />
              {/* Ensure JurisFlix route is present and properly configured */}
              <Route path="/jurisflix" element={<Layout><JurisFlix /></Layout>} />
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
