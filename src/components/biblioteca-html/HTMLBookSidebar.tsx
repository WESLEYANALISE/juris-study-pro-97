
import React from 'react';
import { motion } from 'framer-motion';
import { DocumentoHTML } from '@/types/biblioteca-html';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, BookOpen, Sun, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HTMLBookSidebarProps {
  documento: DocumentoHTML | null;
  secoes: { id: string; titulo: string }[];
  secaoAtual: string;
  onChangeSection: (secaoId: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  darkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  onClose: () => void;
}

export function HTMLBookSidebar({
  documento,
  secoes,
  secaoAtual,
  onChangeSection,
  fontSize,
  setFontSize,
  darkMode,
  setDarkMode,
  onClose
}: HTMLBookSidebarProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-72 bg-background border-l shadow-lg flex flex-col h-full"
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Menu</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Informações</h4>
          {documento && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Título:</span> {documento.titulo}
              </div>
              {documento.autor && (
                <div>
                  <span className="font-medium">Autor:</span> {documento.autor}
                </div>
              )}
              <div>
                <span className="font-medium">Categoria:</span> {documento.categoria}
              </div>
              {documento.tags && documento.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {documento.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Navegação</h4>
            <div className="space-y-1">
              {secoes.map(secao => (
                <Button
                  key={secao.id}
                  variant={secao.id === secaoAtual ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => onChangeSection(secao.id)}
                >
                  <BookOpen className="h-3 w-3 mr-2" />
                  <span className="truncate">{secao.titulo}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <h4 className="text-sm font-medium mb-3">Configurações de Leitura</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tamanho da Fonte</span>
              <span>{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
            />
          </div>
          
          <div className="pt-2">
            <Button
              variant={darkMode ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Modo Escuro
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
