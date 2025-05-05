
import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import { PDFTest } from './components/test/PDFTest';
import Layout from './components/Layout';
import { AuthProvider } from './hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Eagerly load common components
import NotFound from './pages/NotFound';

// Lazily load page components for better performance
const Index = lazy(() => import('./pages/Index'));
const VadeMecum = lazy(() => import('./pages/VadeMecum'));
const VadeMecumViewer = lazy(() => import('./pages/VadeMecumViewer'));
const VadeMecumFavorites = lazy(() => import('./pages/VadeMecumFavorites'));
const BibliotecaJuridica = lazy(() => import('./pages/BibliotecaJuridica'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const Questoes = lazy(() => import('./pages/Questoes'));
const JogosJuridicos = lazy(() => import('./pages/JogosJuridicos'));
const MapasMentais = lazy(() => import('./pages/MapasMentais'));
const RedacaoJuridica = lazy(() => import('./pages/RedacaoJuridica'));
const Peticoes = lazy(() => import('./pages/Peticoes'));
const AssistenteJuridico = lazy(() => import('./pages/AssistenteJuridico'));
const IniciandoNoDireito = lazy(() => import('./pages/IniciandoNoDireito'));
const VideoAulas = lazy(() => import('./pages/VideoAulas'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Dicionario = lazy(() => import('./pages/Dicionario'));
const Anotacoes = lazy(() => import('./pages/Anotacoes'));
const Bloger = lazy(() => import('./pages/Bloger'));
const Cursos = lazy(() => import('./pages/Cursos'));
const CursoViewer = lazy(() => import('./pages/CursoViewer'));

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
                
                {/* Jurisprudência route */}
                <Route path="/jurisprudencia" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Notícias route */}
                <Route path="/noticias" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Cronograma route */}
                <Route path="/cronograma" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Gamificação route */}
                <Route path="/gamificacao" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Remote Desktop route */}
                <Route path="/remote" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
                
                {/* Perfil route */}
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
