
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import { PDFTest } from './components/test/PDFTest';
import Index from './pages/Index';
import Layout from './components/Layout';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        {/* PDFTest component for PDF.js configuration debugging */}
        <PDFTest />
        
        <Router>
          <Routes>
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
