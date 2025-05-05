
import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import { PDFTest } from './components/test/PDFTest';
import Layout from './components/Layout';
import { AuthProvider } from './hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { lazyLoad } from './lib/code-splitting';

// Eagerly load common components
import NotFound from './pages/NotFound';

// Lazily load page components for better performance
const Index = lazyLoad(() => import('./pages/Index'));
const VadeMecum = lazyLoad(() => import('./pages/VadeMecum'));
const VadeMecumViewer = lazyLoad(() => import('./pages/VadeMecumViewer'));
const VadeMecumFavorites = lazyLoad(() => import('./pages/VadeMecumFavorites'));
const BibliotecaJuridica = lazyLoad(() => import('./pages/BibliotecaJuridica'));
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

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner className="h-12 w-12 text-primary" />
  </div>
);

function App() {
  // Track initial loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Set initial load to false after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        {/* Wrap the application with AuthProvider */}
        <AuthProvider>
          {/* PDFTest component for PDF.js configuration debugging */}
          <PDFTest />
          
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
