
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";
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
import VideoAulasInterativas from "@/pages/VideoAulasInterativas";
import Anotacoes from "@/pages/Anotacoes";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="juspedia-theme">
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/inicie" element={<RequireAuth><IniciandoNoDireito /></RequireAuth>} />
            <Route path="/jurisflix" element={<JurisFlix />} />
            <Route path="/dicionario" element={<Dicionario />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/biblioteca/recomendacoes" element={<BibliotecaRecomendacoes />} />
            <Route path="/questoes" element={<RequireAuth><Questoes /></RequireAuth>} />
            <Route path="/vademecum" element={<VadeMecum />} />
            <Route path="/vademecum/:lawId" element={<VadeMecumViewer />} />
            <Route path="/vademecum/:lawId/:articleId" element={<VadeMecumViewer />} />
            <Route path="/simulados" element={<RequireAuth><Simulados /></RequireAuth>} />
            <Route path="/simulados/:sessaoId" element={<RequireAuth><SimuladoSessao /></RequireAuth>} />
            <Route path="/simulados/resultado/:sessaoId" element={<RequireAuth><SimuladoResultado /></RequireAuth>} />
            <Route path="/flashcards" element={<RequireAuth><Flashcards /></RequireAuth>} />
            <Route path="/mapas-mentais" element={<MapasMentais />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/peticoes" element={<Peticoes />} />
            <Route path="/assistente" element={<RequireAuth><AssistenteJuridico /></RequireAuth>} />
            <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
            <Route path="/vermais/:categoria" element={<VerTudo />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/curso/:cursoId" element={<RequireAuth><CursoViewer /></RequireAuth>} />
            <Route path="/redacao-juridica" element={<RedacaoJuridica />} />
            <Route path="/redacao-conteudo/:id?" element={<RedacaoConteudo />} />
            <Route path="/videoaulas" element={<VideoAulas />} />
            <Route path="/videoaulas/tradicionais" element={<VideoAulasTradicional />} />
            <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
            <Route path="/anotacoes" element={<RequireAuth><Anotacoes /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
