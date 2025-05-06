
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
  
  // Estado para armazenar o conteúdo HTML carregado da URL
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [carregandoHTML, setCarregandoHTML] = useState(false);
  const [erroHTML, setErroHTML] = useState<string | null>(null);

  // Função para buscar o conteúdo HTML da URL
  useEffect(() => {
    async function fetchHTMLContent() {
      if (!documento?.conteudo_html) return;
      
      // Verificar se o conteúdo já é HTML ou se é uma URL
      if (documento.conteudo_html.trim().startsWith('<') || documento.conteudo_html.includes('</')) {
        // Já parece ser conteúdo HTML, usar diretamente
        setHtmlContent(documento.conteudo_html);
        return;
      }
      
      try {
        setCarregandoHTML(true);
        setErroHTML(null);
        
        // Assumindo que conteudo_html contém uma URL
        const url = documento.conteudo_html;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar o conteúdo: ${response.status}`);
        }
        
        const html = await response.text();
        setHtmlContent(html);
      } catch (error) {
        console.error("Erro ao carregar o HTML:", error);
        setErroHTML(error instanceof Error ? error.message : "Erro ao carregar o conteúdo HTML");
        toast.error("Erro ao carregar o conteúdo do documento");
      } finally {
        setCarregandoHTML(false);
      }
    }
    
    fetchHTMLContent();
  }, [documento]);

  // Extrair seções do documento quando o conteúdo HTML é carregado
  useEffect(() => {
    if (htmlContent) {
      try {
        // Criar um parser temporário para extrair as seções
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
        const sectionElements = htmlDoc.querySelectorAll('section[id], div[id]');
        
        const secoesParsed = Array.from(sectionElements).map(section => ({
          id: section.id,
          titulo: section.getAttribute('data-title') || section.id
        }));

        setSecoes([
          { id: 'intro', titulo: 'Introdução' },
          ...secoesParsed
        ]);
      } catch (error) {
        console.error("Erro ao analisar o HTML:", error);
        toast.error("Erro ao processar a estrutura do documento");
      }
    }
  }, [htmlContent]);

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
          {carregando || carregandoHTML ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : erroHTML ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-red-500 mb-2">
                <X className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium mb-2">Erro ao carregar o conteúdo</h3>
              <p className="text-muted-foreground">{erroHTML}</p>
              <p className="text-muted-foreground mt-2">
                O link para o conteúdo pode estar quebrado ou inacessível.
              </p>
            </div>
          ) : htmlContent ? (
            <>
              <div 
                className="max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
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
