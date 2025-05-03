
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, Book, FileText, Info } from 'lucide-react';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { toast } from 'sonner';

interface ArticleDetailsProps {
  articleNumber: string;
  lawName: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  onClose: () => void;
}

export const ArticleDetails: React.FC<ArticleDetailsProps> = ({
  articleNumber,
  lawName,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'formal' | 'example'>('technical');
  const [isNarrating, setIsNarrating] = useState(false);

  const handleNarration = async (text: string) => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      return;
    }

    setIsNarrating(true);
    try {
      await TextToSpeechService.speak(text);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      toast.error('Houve um erro ao iniciar a narração');
    } finally {
      setIsNarrating(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'technical':
        return (
          <div className="mt-2 text-sm prose dark:prose-invert max-w-none">
            {technicalExplanation ? (
              <>
                <h4 className="text-base font-medium mb-2">Explicação Técnica</h4>
                <p>{technicalExplanation}</p>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNarration(technicalExplanation)}
                    className="mr-2"
                  >
                    {isNarrating ? "Parar Narração" : "Narrar Explicação"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhuma explicação técnica disponível para este artigo.</p>
            )}
          </div>
        );
      
      case 'formal':
        return (
          <div className="mt-2 text-sm prose dark:prose-invert max-w-none">
            {formalExplanation ? (
              <>
                <h4 className="text-base font-medium mb-2">Explicação Formal</h4>
                <p>{formalExplanation}</p>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNarration(formalExplanation)}
                    className="mr-2"
                  >
                    {isNarrating ? "Parar Narração" : "Narrar Explicação"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhuma explicação formal disponível para este artigo.</p>
            )}
          </div>
        );
      
      case 'example':
        return (
          <div className="mt-2 text-sm prose dark:prose-invert max-w-none">
            {practicalExample ? (
              <>
                <h4 className="text-base font-medium mb-2">Exemplo Prático</h4>
                <p>{practicalExample}</p>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNarration(practicalExample)}
                    className="mr-2"
                  >
                    {isNarrating ? "Parar Narração" : "Narrar Exemplo"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhum exemplo prático disponível para este artigo.</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-muted/30 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Detalhes do Artigo {articleNumber}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XCircle size={18} />
        </Button>
      </div>
      
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'technical' ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab('technical')}
          className="gap-1"
        >
          <Info size={16} />
          <span>Técnica</span>
        </Button>
        <Button
          variant={activeTab === 'formal' ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab('formal')}
          className="gap-1"
        >
          <Book size={16} />
          <span>Formal</span>
        </Button>
        <Button
          variant={activeTab === 'example' ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab('example')}
          className="gap-1"
          disabled={!practicalExample}
        >
          <FileText size={16} />
          <span>Exemplo</span>
        </Button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ArticleDetails;
