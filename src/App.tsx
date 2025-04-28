
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
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
          <Route path="/" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Index />}</Layout>} />
          <Route path="/inicie" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<IniciandoNoDireito />}</Layout></RequireAuth>} />
          <Route path="/jurisflix" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<JurisFlix />}</Layout>} />
          <Route path="/dicionario" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Dicionario />}</Layout>} />
          <Route path="/biblioteca" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Biblioteca />}</Layout>} />
          <Route path="/biblioteca/recomendacoes" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<BibliotecaRecomendacoes />}</Layout>} />
          <Route path="/questoes" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<Questoes />}</Layout></RequireAuth>} />
          <Route path="/vademecum" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VadeMecum />}</Layout>} />
          <Route path="/vademecum/:lawId" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VadeMecumViewer />}</Layout>} />
          <Route path="/vademecum/:lawId/:articleId" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VadeMecumViewer />}</Layout>} />
          <Route path="/simulados" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<Simulados />}</Layout></RequireAuth>} />
          <Route path="/simulados/:sessaoId" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<SimuladoSessao />}</Layout></RequireAuth>} />
          <Route path="/simulados/resultado/:sessaoId" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<SimuladoResultado />}</Layout></RequireAuth>} />
          <Route path="/flashcards" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<Flashcards />}</Layout></RequireAuth>} />
          <Route path="/mapas-mentais" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<MapasMentais />}</Layout>} />
          <Route path="/noticias" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Noticias />}</Layout>} />
          <Route path="/peticoes" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Peticoes />}</Layout>} />
          <Route path="/assistente" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<AssistenteJuridico />}</Layout></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<Perfil />}</Layout></RequireAuth>} />
          <Route path="/vermais/:categoria" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VerTudo />}</Layout>} />
          <Route path="/cursos" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<Cursos />}</Layout>} />
          <Route path="/curso/:cursoId" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<CursoViewer />}</Layout></RequireAuth>} />
          <Route path="/redacao-juridica" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<RedacaoJuridica />}</Layout>} />
          <Route path="/redacao-conteudo/:id?" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<RedacaoConteudo />}</Layout>} />
          <Route path="/videoaulas" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VideoAulas />}</Layout>} />
          <Route path="/videoaulas/tradicionais" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VideoAulasTradicional />}</Layout>} />
          <Route path="/videoaulas-interativas" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<VideoAulasInterativas />}</Layout>} />
          <Route path="/anotacoes" element={<RequireAuth><Layout userProfile={{name: '', image: '', role: ''}}>{<Anotacoes />}</Layout></RequireAuth>} />
          <Route path="*" element={<Layout userProfile={{name: '', image: '', role: ''}}>{<NotFound />}</Layout>} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
