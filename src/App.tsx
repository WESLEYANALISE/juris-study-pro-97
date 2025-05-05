
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import { PDFTest } from './components/test/PDFTest';
import Index from './pages/Index';
import Layout from './components/Layout';
import { AuthProvider } from './hooks/use-auth';
import VadeMecum from './pages/VadeMecum';
import VadeMecumViewer from './pages/VadeMecumViewer';
import VadeMecumFavorites from './pages/VadeMecumFavorites';
import NotFound from './pages/NotFound';
import BibliotecaJuridica from './pages/BibliotecaJuridica';
import Podcasts from './pages/Podcasts';
import Questoes from './pages/Questoes';
import JogosJuridicos from './pages/JogosJuridicos';
import MapasMentais from './pages/MapasMentais';
import RedacaoJuridica from './pages/RedacaoJuridica';
import Peticoes from './pages/Peticoes';
import AssistenteJuridico from './pages/AssistenteJuridico';
import IniciandoNoDireito from './pages/IniciandoNoDireito';
import VideoAulas from './pages/VideoAulas';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        {/* Wrap the application with AuthProvider */}
        <AuthProvider>
          {/* PDFTest component for PDF.js configuration debugging */}
          <PDFTest />
          
          <Router>
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

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
