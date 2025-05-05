import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';
import { AuthProvider } from './hooks/use-auth';
import { LoadingState } from '@/components/ui/loading-state';
import { lazyLoad } from './lib/code-splitting';
import { queryClient } from './lib/query-client';
import { configurePdfWorker } from './lib/pdf-config';

// Eagerly load critical components
import NotFound from './pages/NotFound';
import { PDFConfigValidator } from '@/components/pdf/PDFConfigValidator';

// Lazily load page components with improved loading
const Index = lazyLoad(() => import('./pages/Index'), 'home');
const VadeMecum = lazyLoad(() => import('./pages/VadeMecum'), 'vademecum');
const VadeMecumViewer = lazyLoad(() => import('./pages/VadeMecumViewer'), 'vademecum-viewer');
const VadeMecumFavorites = lazyLoad(() => import('./pages/VadeMecumFavorites'), 'vademecum-fav');
const BibliotecaJuridica = lazyLoad(() => import('./pages/BibliotecaJuridica'), 'biblioteca');
const Podcasts = lazyLoad(() => import('./pages/Podcasts'));
const Questoes = lazyLoad(() => import('./pages/Questoes'));
const JogosJuridicos = lazyLoad(() => import('./pages/JogosJuridicos'));
const MapasMentais = lazyLoad(() => import('./pages/MapasMentais'));
const RedacaoJuridica = lazyLoad(() => import('./pages/RedacaoJuridica'));
const Peticoes = lazyLoad(() => import('./pages/Peticoes'));
const AssistenteJuridico = lazyLoad(() => import('./pages/AssistenteJuridico'));
const IniciandoNoDireito = lazyLoad(() => import('./pages/IniciandoNoDireito'));
const VideoAulas = lazyLoad(() => import('./pages/VideoAulas'));
const Flashcards = lazyLoad(() => import('./pages/Flashcards'));
const Dicionario = lazyLoad(() => import('./pages/Dicionario'));
const Anotacoes = lazyLoad(() => import('./pages/Anotacoes'));
const Bloger = lazyLoad(() => import('./pages/Bloger'));
const Cursos = lazyLoad(() => import('./pages/Cursos'));
const CursoViewer = lazyLoad(() => import('./pages/CursoViewer'));
const Simulados = lazyLoad(() => import('./pages/Simulados'));
const Noticias = lazyLoad(() => import('./pages/Noticias'));

// Loading component for suspense fallback
const PageLoader = () => (
  <LoadingState
    variant="skeleton"
    count={3}
    height="h-32"
    className="max-w-4xl mx-auto mt-8"
  />
);

function App() {
  useEffect(() => {
    // Configure PDF.js worker when App mounts
    configurePdfWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <AuthProvider>
          <PDFConfigValidator />
          
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Home page */}
                <Route path="/" element={
                  <Layout>
                    <Index />
                  </Layout>
                } />
                
                {/* VadeMecum routes */}
                <Route path="/vademecum" element={
                  <Layout>
                    <VadeMecum />
                  </Layout>
                } />
                <Route path="/vademecum/:lawId" element={
                  <Layout>
                    <VadeMecumViewer />
                  </Layout>
                } />
                <Route path="/vademecum/favoritos" element={
                  <Layout>
                    <VadeMecumFavorites />
                  </Layout>
                } />
                
                {/* Biblioteca Jurídica route */}
                <Route path="/biblioteca-juridica" element={
                  <Layout>
                    <BibliotecaJuridica />
                  </Layout>
                } />
                
                {/* Redirect /biblioteca to /biblioteca-juridica */}
                <Route path="/biblioteca" element={<Navigate to="/biblioteca-juridica" replace />} />
                
                {/* Podcasts route */}
                <Route path="/podcasts" element={
                  <Layout>
                    <Podcasts />
                  </Layout>
                } />
                
                {/* Questões route */}
                <Route path="/questoes" element={
                  <Layout>
                    <Questoes />
                  </Layout>
                } />
                
                {/* Simulados route */}
                <Route path="/simulados" element={
                  <Layout>
                    <Simulados />
                  </Layout>
                } />
                
                {/* Jogos Jurídicos route */}
                <Route path="/jogos" element={
                  <Layout>
                    <JogosJuridicos />
                  </Layout>
                } />
                
                {/* Mapas Mentais route */}
                <Route path="/mapas-mentais" element={
                  <Layout>
                    <MapasMentais />
                  </Layout>
                } />
                
                {/* Redação Jurídica route */}
                <Route path="/redacao-juridica" element={
                  <Layout>
                    <RedacaoJuridica />
                  </Layout>
                } />
                
                {/* Petições route */}
                <Route path="/peticoes" element={
                  <Layout>
                    <Peticoes />
                  </Layout>
                } />
                
                {/* Redirect /peticionario to /peticoes */}
                <Route path="/peticionario" element={<Navigate to="/peticoes" replace />} />
                
                {/* Assistente Jurídico route */}
                <Route path="/assistente" element={
                  <Layout>
                    <AssistenteJuridico />
                  </Layout>
                } />
                
                {/* Iniciando no Direito route */}
                <Route path="/inicie" element={
                  <Layout>
                    <IniciandoNoDireito />
                  </Layout>
                } />
                
                {/* Video Aulas route */}
                <Route path="/videoaulas" element={
                  <Layout>
                    <VideoAulas />
                  </Layout>
                } />

                {/* Flashcards route */}
                <Route path="/flashcards" element={
                  <Layout>
                    <Flashcards />
                  </Layout>
                } />
                
                {/* Dicionário Jurídico route */}
                <Route path="/dicionario" element={
                  <Layout>
                    <Dicionario />
                  </Layout>
                } />
                
                {/* Anotações route */}
                <Route path="/anotacoes" element={
                  <Layout>
                    <Anotacoes />
                  </Layout>
                } />
                
                {/* Blog Jurídico route */}
                <Route path="/blog" element={
                  <Layout>
                    <Bloger />
                  </Layout>
                } />

                {/* Cursos route */}
                <Route path="/cursos" element={
                  <Layout>
                    <Cursos />
                  </Layout>
                } />
                
                {/* Curso viewer route */}
                <Route path="/curso/:cursoId" element={
                  <Layout>
                    <CursoViewer />
                  </Layout>
                } />
                
                {/* Notícias route */}
                <Route path="/noticias" element={
                  <Layout>
                    <Noticias />
                  </Layout>
                } />
                
                {/* Jurisprudência route - Using NotFound for now */}
                <Route path="/jurisprudencia" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Cronograma route - Using NotFound for now */}
                <Route path="/cronograma" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Gamificação route - Using NotFound for now */}
                <Route path="/gamificacao" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Remote Desktop route - Using NotFound for now */}
                <Route path="/remote" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Perfil route - Using NotFound for now */}
                <Route path="/perfil" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
