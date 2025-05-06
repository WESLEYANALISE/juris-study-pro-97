
import React, { useState } from 'react';
import { Annotation, Bookmark } from '@/hooks/use-pdf-annotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  X, Bookmark as BookmarkIcon, Pencil, Trash2, Save, 
  FileDown, Plus, BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnotationSidebarProps {
  annotations: Annotation[];
  bookmarks: Bookmark[];
  currentPage: number;
  onAddAnnotation: (annotation: Omit<Annotation, 'user_id'>) => Promise<any>;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => Promise<boolean>;
  onDeleteAnnotation: (id: string) => Promise<boolean>;
  onAddBookmark: (bookmark: Omit<Bookmark, 'user_id'>) => Promise<any>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<boolean>;
  onDeleteBookmark: (id: string) => Promise<boolean>;
  onExport: () => void;
  bookId: string;
  darkMode?: boolean;
}

export function AnnotationSidebar({
  annotations,
  bookmarks,
  currentPage,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onExport,
  bookId,
  darkMode = false
}: AnnotationSidebarProps) {
  const [activeTab, setActiveTab] = useState<'annotations' | 'bookmarks'>('annotations');
  const [newAnnotation, setNewAnnotation] = useState('');
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Filter annotations for current page
  const pageAnnotations = annotations.filter(anno => anno.page === currentPage);
  
  // Current page bookmark if exists
  const currentPageBookmark = bookmarks.find(bm => bm.page === currentPage);
  
  // Handle creating a new annotation
  const handleCreateAnnotation = async () => {
    if (!newAnnotation.trim()) return;
    
    const annotation = {
      book_id: bookId,
      page: currentPage,
      text: newAnnotation,
      color: '#FFFF00', // Default yellow highlight
      position: null
    };
    
    const result = await onAddAnnotation(annotation);
    if (result) {
      setNewAnnotation('');
    }
  };
  
  // Handle creating a new bookmark
  const handleCreateBookmark = async () => {
    const title = newBookmarkTitle.trim() || `Página ${currentPage}`;
    
    const bookmark = {
      book_id: bookId,
      page: currentPage,
      title,
      color: '#4C7BF4' // Default blue bookmark color
    };
    
    const result = await onAddBookmark(bookmark);
    if (result) {
      setNewBookmarkTitle('');
    }
  };
  
  // Handle removing a bookmark
  const handleRemoveBookmark = async () => {
    if (currentPageBookmark?.id) {
      await onDeleteBookmark(currentPageBookmark.id);
    }
  };
  
  // Start editing an annotation
  const startEditing = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
  };
  
  // Save edited annotation
  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    
    const success = await onUpdateAnnotation(editingId, { text: editText });
    if (success) {
      setEditingId(null);
      setEditText('');
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 w-80 p-4 shadow-xl z-40 overflow-auto",
        darkMode ? "bg-gray-900/80 backdrop-blur-md text-white" : "bg-white/90 backdrop-blur-md text-black"
      )}
    >
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Página {currentPage}</h3>
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'annotations' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('annotations')}
              className="h-8"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Anotações
            </Button>
            <Button
              variant={activeTab === 'bookmarks' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab('bookmarks')}
              className="h-8"
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Marcadores
            </Button>
          </div>
        </div>
        
        {activeTab === 'annotations' ? (
          <>
            <div className="mb-4">
              <Textarea
                value={newAnnotation}
                onChange={e => setNewAnnotation(e.target.value)}
                placeholder="Adicione uma anotação para esta página..."
                className={cn(
                  "w-full p-2 rounded-md text-sm",
                  darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
                )}
                rows={3}
              />
              <Button 
                onClick={handleCreateAnnotation} 
                className="mt-2 w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Anotação
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Anotações desta página</h4>
                <Button variant="outline" size="sm" onClick={onExport}>
                  <FileDown className="h-4 w-4 mr-1" /> Exportar
                </Button>
              </div>
              
              {pageAnnotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma anotação para esta página
                </div>
              ) : (
                <div className="space-y-3">
                  {pageAnnotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className={cn(
                        "p-3 rounded-md relative",
                        darkMode ? "bg-gray-800/80" : "bg-gray-100"
                      )}
                    >
                      {editingId === annotation.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className={cn(
                              "w-full text-sm",
                              darkMode ? "bg-gray-700" : "bg-white"
                            )}
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-4 w-4 mr-1" /> Cancelar
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="h-4 w-4 mr-1" /> Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Pencil className="h-3 w-3 mr-1" />
                              {annotation.created_at && (
                                <span>{new Date(annotation.created_at).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => startEditing(annotation)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => onDeleteAnnotation(annotation.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mt-1">{annotation.text}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Bookmarks tab */}
            <div className="mb-4">
              {currentPageBookmark ? (
                <div className={cn(
                  "p-3 rounded-md",
                  darkMode ? "bg-blue-900/30" : "bg-blue-50"
                )}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BookmarkCheck className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Esta página está marcada</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={handleRemoveBookmark}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium mt-1">{currentPageBookmark.title}</p>
                </div>
              ) : (
                <div>
                  <Input
                    value={newBookmarkTitle}
                    onChange={e => setNewBookmarkTitle(e.target.value)}
                    placeholder="Título do marcador (opcional)"
                    className={cn(
                      "mb-2",
                      darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
                    )}
                  />
                  <Button 
                    onClick={handleCreateBookmark} 
                    className="w-full"
                    size="sm"
                  >
                    <BookmarkIcon className="h-4 w-4 mr-1" /> Marcar esta página
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Todos os marcadores</h4>
              
              {bookmarks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum marcador adicionado
                </div>
              ) : (
                <div className="space-y-1">
                  {bookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className={cn(
                        "p-2 rounded flex justify-between items-center",
                        bookmark.page === currentPage ? 
                          (darkMode ? "bg-blue-900/30" : "bg-blue-50") : 
                          (darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"),
                        "transition-colors"
                      )}
                    >
                      <div className="flex items-center">
                        <BookmarkIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium text-sm">{bookmark.title}</div>
                          <div className="text-xs text-muted-foreground">Página {bookmark.page}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => onDeleteBookmark(bookmark.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
