
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBibliotecaHTML } from '@/hooks/use-biblioteca-html';
import { HTMLBookNavigation } from './HTMLBookNavigation';
import { HTMLBookSidebar } from './HTMLBookSidebar';
import { DocumentoHTML } from '@/types/biblioteca-html';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkPlus, X, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import './HTMLBookViewer.css';

interface HTMLBookViewerProps {
  documentoId: string;
  onClose: () => void;
}

export function HTMLBookViewer({ documentoId, onClose }: HTMLBookViewerProps) {
  const { 
    documento, 
    secaoAtual,
    progresso, 
    marcadores,
    anotacoes,
    atualizarProgresso,
    alternarFavorito,
    adicionarMarcador,
    carregando,
    temMarcador,
    getAnotacoesPorSecao,
    setSecaoAtual
  } = useBibliotecaHTML(documentoId);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [secoes, setSecoes] = useState<{ id: string; titulo: string; }[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Extrair seções do documento quando o conteúdo é carregado
  useEffect(() => {
    if (documento?.conteudo_html) {
      // Criar um parser temporário para extrair as seções
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(documento.conteudo_html, 'text/html');
      const sectionElements = htmlDoc.querySelectorAll('section[id], div[id]');
      
      const secoesParsed = Array.from(sectionElements).map(section => ({
        id: section.id,
        titulo: section.getAttribute('data-title') || section.id
      }));

      setSecoes([
        { id: 'intro', titulo: 'Introdução' },
        ...secoesParsed
      ]);
    }
  }, [documento]);

  // Manipuladores de eventos
  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar marcadores');
      return;
    }

    if (temMarcador(secaoAtual)) {
      // Lógica para remover marcador
      const marcador = marcadores.find(m => m.secao_id === secaoAtual);
      if (marcador?.id) {
        // removerMarcador(marcador.id) está implementado no hook
      }
    } else {
      // Lógica para adicionar marcador
      const secaoElement = document.querySelector('.secao-ativa');
      const tituloSecao = secaoElement?.getAttribute('data-title') || 'Marcador';
      
      // Fix: Ensure we're passing a string, not an Element
      const secaoId = secaoAtual || 'intro';
      await adicionarMarcador(tituloSecao, secaoId);
    }
  };

  const handleSectionChange = (secaoId: string) => {
    // Atualizar a seção atual
    setSecaoAtual(secaoId);
    
    // Scrollar para a seção
    const secaoElement = document.getElementById(secaoId);
    if (secaoElement) {
      secaoElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Fechar o sidebar se estiver em modo mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    
    // Calcular o progresso
    if (user && secoes.length > 0) {
      const indiceSecaoAtual = secoes.findIndex(s => s.id === secaoId);
      const porcentagem = Math.round((indiceSecaoAtual / secoes.length) * 100);
      atualizarProgresso(secaoId, porcentagem);
    }
  };

  // Verificar qual seção está visível ao rolar
  useEffect(() => {
    if (!contentRef.current || !documento) return;
    
    const handleScroll = () => {
      const containerRect = contentRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // Encontrar a seção mais visível
      let maxVisibility = 0;
      let mostVisibleSection = '';
      
      secoes.forEach(secao => {
        const sectionElement = document.getElementById(secao.id);
        if (!sectionElement) return;
        
        const sectionRect = sectionElement.getBoundingClientRect();
        const visibleHeight = Math.min(sectionRect.bottom, containerRect.bottom) - 
                             Math.max(sectionRect.top, containerRect.top);
        
        if (visibleHeight > maxVisibility && visibleHeight > 0) {
          maxVisibility = visibleHeight;
          mostVisibleSection = secao.id;
        }
      });
      
      if (mostVisibleSection && mostVisibleSection !== secaoAtual) {
        setSecaoAtual(mostVisibleSection);
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [documento, secoes, secaoAtual, setSecaoAtual]);

  // Adicionar classe para modo escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-reader');
    } else {
      document.documentElement.classList.remove('dark-reader');
    }
    
    return () => {
      document.documentElement.classList.remove('dark-reader');
    };
  }, [darkMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 flex flex-col"
    >
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-primary/20 to-background p-4 flex items-center justify-between border-b shadow-sm">
        <h2 className="text-xl font-semibold line-clamp-1">{documento?.titulo || 'Carregando...'}</h2>
        <div className="flex gap-2">
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => alternarFavorito()}
              disabled={!progresso}
            >
              {progresso?.favorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {sidebarOpen ? 'Fechar' : 'Menu'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navegação Superior */}
        <HTMLBookNavigation 
          secoes={secoes}
          secaoAtual={secaoAtual}
          onChangeSection={handleSectionChange}
        />
        
        {/* Área de Conteúdo */}
        <div 
          ref={contentRef}
          className={`flex-1 overflow-y-auto p-4 relative html-content ${darkMode ? 'dark-mode' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {carregando ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : documento ? (
            <>
              <div 
                className="max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: documento.conteudo_html }} 
              />
              
              {/* Botão flutuante para marcador */}
              {user && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="fixed bottom-6 right-6 shadow-lg"
                  onClick={handleBookmarkToggle}
                >
                  {temMarcador(secaoAtual) ? (
                    <><Bookmark className="h-4 w-4 mr-2" /> Marcado</>
                  ) : (
                    <><BookmarkPlus className="h-4 w-4 mr-2" /> Marcar</>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center">
              <p>Não foi possível carregar o documento.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar com informações e controles */}
        <AnimatePresence>
          {sidebarOpen && (
            <HTMLBookSidebar 
              documento={documento}
              secoes={secoes}
              secaoAtual={secaoAtual}
              onChangeSection={handleSectionChange}
              fontSize={fontSize}
              setFontSize={setFontSize}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
