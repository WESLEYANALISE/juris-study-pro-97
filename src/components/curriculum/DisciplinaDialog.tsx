
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Book, 
  BookOpen, 
  Brain, 
  FileText, 
  Lightbulb, 
  LinkIcon, 
  MapPin, 
  Network, 
  Video 
} from 'lucide-react';
import type { Disciplina, UserProgressoDisciplina, DisciplinaMaterial, AIGeneratedContent } from '@/types/curriculum';
import { useCurriculum } from '@/hooks/use-curriculum';
import { getAreaColor } from '@/lib/curriculum-utils';

interface DisciplinaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  disciplina: Disciplina;
  userProgress?: UserProgressoDisciplina;
}

export function DisciplinaDialog({ isOpen, onClose, disciplina, userProgress }: DisciplinaDialogProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [materials, setMaterials] = useState<DisciplinaMaterial[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [anotacoes, setAnotacoes] = useState(userProgress?.anotacoes || '');
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [generatedContent, setGeneratedContent] = useState<Record<string, AIGeneratedContent | null>>({});
  
  const { fetchDisciplinaMaterials, updateUserProgress, generateAIContent } = useCurriculum();

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
      setAnotacoes(userProgress?.anotacoes || '');
    }
  }, [isOpen, disciplina.id, userProgress]);

  const loadMaterials = async () => {
    if (!isOpen) return;
    
    setIsLoadingMaterials(true);
    try {
      const materialsData = await fetchDisciplinaMaterials(disciplina.id);
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const handleSaveNotes = () => {
    updateUserProgress({
      disciplina_id: disciplina.id,
      anotacoes
    });
  };

  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(prev => ({ ...prev, [contentType]: true }));
    
    try {
      const result = await generateAIContent(disciplina.nome, contentType);
      setGeneratedContent(prev => ({ ...prev, [contentType]: result }));
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [contentType]: false }));
    }
  };

  const renderMaterialContent = () => {
    if (isLoadingMaterials) {
      return (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (materials.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
          <h3 className="text-lg font-medium mb-1">Nenhum material disponível</h3>
          <p className="text-muted-foreground">
            Não existem materiais cadastrados para esta disciplina.
          </p>
        </div>
      );
    }
    
    // Group materials by type
    const groupedMaterials: Record<string, DisciplinaMaterial[]> = {};
    materials.forEach(material => {
      if (!groupedMaterials[material.tipo]) {
        groupedMaterials[material.tipo] = [];
      }
      groupedMaterials[material.tipo].push(material);
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedMaterials).map(([tipo, items]) => (
          <div key={tipo} className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              {tipo === 'pdf' && <FileText className="h-4 w-4" />}
              {tipo === 'video' && <Video className="h-4 w-4" />}
              {tipo === 'link' && <LinkIcon className="h-4 w-4" />}
              {tipo === 'livro' && <Book className="h-4 w-4" />}
              {tipo === 'mapa_mental' && <Network className="h-4 w-4" />}
              {tipo === 'pdf' && 'Documentos'}
              {tipo === 'video' && 'Vídeos'}
              {tipo === 'link' && 'Links'}
              {tipo === 'livro' && 'Livros recomendados'}
              {tipo === 'mapa_mental' && 'Mapas mentais'}
            </h3>
            
            <div className="space-y-2">
              {items.map(material => (
                <a 
                  key={material.id} 
                  href={material.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-grow">
                    <h4 className="font-medium">{material.titulo}</h4>
                    {material.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{material.descricao}</p>
                    )}
                    {material.autor && (
                      <p className="text-xs text-muted-foreground mt-1">Por: {material.autor}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{disciplina.nome}</DialogTitle>
            <Badge variant="outline" className={`${getAreaColor(disciplina.area)}`}>
              {disciplina.area}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {disciplina.periodo}º Período
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Informações</span>
            </TabsTrigger>
            <TabsTrigger value="materiais" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="resumos" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Resumos</span>
            </TabsTrigger>
            <TabsTrigger value="anotacoes" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Anotações</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Descrição:</h3>
                <p className="text-muted-foreground">
                  {disciplina.descricao || "Sem descrição disponível."}
                </p>
              </div>
              
              {disciplina.ementa && (
                <div>
                  <h3 className="font-medium mb-1">Ementa:</h3>
                  <p className="text-muted-foreground">{disciplina.ementa}</p>
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateContent('summary')}
                  disabled={isGenerating['summary']}
                  className="mr-2"
                >
                  {isGenerating['summary'] ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Gerar resumo com IA
                    </>
                  )}
                </Button>
              </div>
              
              {generatedContent['summary'] && (
                <div className="p-4 border rounded-md bg-muted/30 mt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Resumo gerado por IA:
                  </h3>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {generatedContent['summary'].content}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="materiais" className="mt-4">
            {renderMaterialContent()}
          </TabsContent>
          
          <TabsContent value="resumos" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleGenerateContent('mindmap')}
                disabled={isGenerating['mindmap']}
              >
                <Network className="h-10 w-10 mb-2" />
                <span className="font-medium">Gerar mapa mental</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Cria um mapa mental da disciplina usando IA
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleGenerateContent('materials')}
                disabled={isGenerating['materials']}
              >
                <Book className="h-10 w-10 mb-2" />
                <span className="font-medium">Material recomendado</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Sugere materiais de estudo para esta disciplina
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleGenerateContent('questions')}
                disabled={isGenerating['questions']}
              >
                <FileText className="h-10 w-10 mb-2" />
                <span className="font-medium">Questões de estudo</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Gera questões de múltipla escolha para praticar
                </span>
              </Button>
            </div>
            
            {Object.entries(generatedContent).map(([type, content]) => {
              if (!content || type === 'summary') return null;
              
              return (
                <div key={type} className="p-4 border rounded-md bg-muted/30 mt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    {type === 'mindmap' && <Network className="h-4 w-4" />}
                    {type === 'materials' && <Book className="h-4 w-4" />}
                    {type === 'questions' && <FileText className="h-4 w-4" />}
                    {type === 'mindmap' && 'Mapa mental'}
                    {type === 'materials' && 'Material recomendado'}
                    {type === 'questions' && 'Questões de estudo'}
                  </h3>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {content.content}
                  </div>
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="anotacoes" className="mt-4">
            <div className="space-y-4">
              <Textarea 
                placeholder="Escreva suas anotações sobre esta disciplina..."
                className="min-h-[200px]"
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
              />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotes}>
                  Salvar anotações
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
