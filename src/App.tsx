import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import OptimizedLayout from "@/components/OptimizedLayout"; // Import the optimized layout
import { RequireAuth } from "@/components/RequireAuth";
import { AuthProvider } from "@/hooks/use-auth";
import { lazy, Suspense } from "react"; // Import for code splitting
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Core pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";

// React.lazy for code splitting - load components only when needed
const Podcasts = lazy(() => import("@/pages/Podcasts"));
const Dicionario = lazy(() => import("@/pages/Dicionario"));
const BibliotecaJuridicaPage = lazy(() => import("@/pages/BibliotecaJuridicaPage"));
const BibliotecaHTMLPage = lazy(() => import("@/pages/BibliotecaHTMLPage"));
const BibliotecaRecomendacoes = lazy(() => import("@/pages/BibliotecaRecomendacoes"));
const Questoes = lazy(() => import("@/pages/Questoes"));
const VadeMecum = lazy(() => import("@/pages/VadeMecum"));
const VadeMecumViewer = lazy(() => import("@/pages/VadeMecumViewer"));
const VadeMecumFavorites = lazy(() => import("@/pages/VadeMecumFavorites"));
const Simulados = lazy(() => import("@/pages/Simulados"));
const SimuladoCategoria = lazy(() => import("@/pages/SimuladoCategoria"));
const SimuladoSessao = lazy(() => import("@/pages/SimuladoSessao"));
const SimuladoResultado = lazy(() => import("@/pages/SimuladoResultado"));
const Flashcards = lazy(() => import("@/pages/Flashcards"));
const MapasMentais = lazy(() => import("@/pages/MapasMentais"));
const Peticoes = lazy(() => import("@/pages/Peticoes"));
const AssistenteJuridico = lazy(() => import("@/pages/AssistenteJuridico"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const IniciandoNoDireito = lazy(() => import("@/pages/IniciandoNoDireito"));
const PDFLinksPage = lazy(() => import("@/pages/PDFLinksPage"));
const Livro9Page = lazy(() => import("@/pages/Livro9Page"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const VerTudo = lazy(() => import("@/pages/VerTudo"));
const Cursos = lazy(() => import("@/pages/Cursos"));
const CursoViewer = lazy(() => import("@/pages/CursoViewer"));
const RedacaoJuridica = lazy(() => import("@/pages/RedacaoJuridica"));
const RedacaoConteudo = lazy(() => import("@/pages/RedacaoConteudo"));
const VideoAulas = lazy(() => import("@/pages/VideoAulas"));
const VideoAulasTradicional = lazy(() => import("@/pages/VideoAulasTradicional"));
const VideoAulasInterativas = lazy(() => import("@/pages/VideoAulasInterativas"));
const VideoAulasRecomendacoes = lazy(() => import("@/pages/VideoAulasRecomendacoes"));
const Anotacoes = lazy(() => import("@/pages/Anotacoes"));
const JogosJuridicos = lazy(() => import("@/pages/JogosJuridicos"));
const JogoDetalhes = lazy(() => import("@/pages/JogoDetalhes"));
const JurisFlix = lazy(() => import("@/pages/JurisFlix"));

// Loading Component for React.lazy
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-[80vh]">
    <div className="text-center">
      <LoadingSpinner className="h-12 w-12 mx-auto text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider storageKey="juspedia-theme">
      <AuthProvider>
        <Router>
          <RequireAuth>
            <Routes>
              {/* Auth page outside layout */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Use OptimizedLayout for all pages */}
              <Route element={
                <Suspense fallback={<LoadingComponent />}>
                  <OptimizedLayout>
                    <Outlet />
                  </OptimizedLayout>
                </Suspense>
              }>
                <Route path="/" element={<Home />} />
                <Route path="/inicie" element={<IniciandoNoDireito />} />
                <Route path="/podcasts" element={<Podcasts />} />
                <Route path="/dicionario" element={<Dicionario />} />
                
                {/* Library routes */}
                <Route path="/biblioteca" element={<Navigate to="/biblioteca-juridica" replace />} />
                <Route path="/biblioteca-juridica" element={<BibliotecaJuridicaPage />} />
                <Route path="/biblioteca/recomendacoes" element={<BibliotecaRecomendacoes />} />
                <Route path="/biblioteca-html" element={<BibliotecaHTMLPage />} />
                <Route path="/pdf-links" element={<PDFLinksPage />} />
                <Route path="/livro9" element={<Livro9Page />} />
                
                {/* Other routes */}
                <Route path="/questoes" element={<Questoes />} />
                <Route path="/vademecum" element={<VadeMecum />} />
                <Route path="/vademecum/:lawId" element={<VadeMecumViewer />} />
                <Route path="/vademecum/favoritos" element={<VadeMecumFavorites />} />
                <Route path="/vademecum/:lawId/:articleId" element={<VadeMecumViewer />} />
                <Route path="/simulados" element={<Simulados />} />
                <Route path="/simulados/:categoria" element={<SimuladoCategoria />} />
                <Route path="/simulados/:categoria/sessao/:sessaoId" element={<SimuladoSessao />} />
                <Route path="/simulados/resultado/:sessaoId" element={<SimuladoResultado />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/mapas-mentais" element={<MapasMentais />} />
                <Route path="/peticoes" element={<Peticoes />} />
                <Route path="/assistente" element={<AssistenteJuridico />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/vermais/:categoria" element={<VerTudo />} />
                <Route path="/cursos" element={<Cursos />} />
                <Route path="/curso/:cursoId" element={<CursoViewer />} />
                <Route path="/redacao-juridica" element={<RedacaoJuridica />} />
                <Route path="/redacao-conteudo/:id?" element={<RedacaoConteudo />} />
                <Route path="/videoaulas" element={<VideoAulas />} />
                <Route path="/videoaulas/tradicionais" element={<VideoAulasTradicional />} />
                <Route path="/videoaulas/recomendacoes" element={<VideoAulasRecomendacoes />} />
                <Route path="/videoaulas-interativas" element={<VideoAulasInterativas />} />
                <Route path="/anotacoes" element={<Anotacoes />} />
                <Route path="/jogos" element={<JogosJuridicos />} />
                <Route path="/jogos/:jogoId" element={<JogoDetalhes />} />
                <Route path="/jurisflix" element={<JurisFlix />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </RequireAuth>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
