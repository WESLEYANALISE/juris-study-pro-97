import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, Bookmark, BookmarkCheck, Copy, Info, ZoomIn, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TextToSpeechService } from '@/services/textToSpeechService';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
interface ArticleCardProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}
const ArticleCard = ({
  lawName,
  articleNumber,
  articleText,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  fontSize,
  onFontSizeChange
}: ArticleCardProps) => {
  const {
    user
  } = useAuth();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if article is favorited on component mount
  React.useEffect(() => {
    if (user) {
      checkIsFavorite();
    }
  }, [user]);
  const checkIsFavorite = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('vademecum_favorites').select('id').eq('user_id', user.id).eq('law_name', lawName).eq('article_number', articleNumber).single();
    setIsFavorite(!!data);
  };
  const handleNarration = async (text: string) => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      await TextToSpeechService.speak(text);
      setIsNarrating(false);
    }
  };
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Texto copiado para a área de transferência');
  };
  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }
    try {
      if (isFavorite) {
        await supabase.from('vademecum_favorites').delete().eq('user_id', user.id).eq('law_name', lawName).eq('article_number', articleNumber);
      } else {
        await supabase.from('vademecum_favorites').insert({
          user_id: user.id,
          law_name: lawName,
          article_id: articleNumber,
          article_number: articleNumber,
          article_text: articleText
        });
      }
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Artigo removido dos favoritos' : 'Artigo adicionado aos favoritos');
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    }
  };
  return <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">Art. {articleNumber}</h3>
          <p style={{
          fontSize: `${fontSize}px`
        }} className="mt-2 whitespace-pre-line text-left px-[2px] mx-[2px] my-[14px] py-[7px]">
            {articleText}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleNarration(articleText)}>
            <Volume2 className={isNarrating ? 'text-primary' : ''} />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFavorite}>
            {isFavorite ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Info size={16} />
              Explicação
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              {technicalExplanation && <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    Explicação Técnica
                    <div className="space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleNarration(technicalExplanation)}>
                        <Volume2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(technicalExplanation)}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  </h4>
                  <p className="text-sm">{technicalExplanation}</p>
                </div>}
              {formalExplanation && <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    Explicação Formal
                    <div className="space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleNarration(formalExplanation)}>
                        <Volume2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(formalExplanation)}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  </h4>
                  <p className="text-sm">{formalExplanation}</p>
                </div>}
            </div>
          </PopoverContent>
        </Popover>

        {practicalExample && <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText size={16} />
                Exemplo Prático
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Exemplo</h4>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleNarration(practicalExample)}>
                      <Volume2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(practicalExample)}>
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{practicalExample}</p>
              </div>
            </PopoverContent>
          </Popover>}

        <Button variant="outline" size="icon" onClick={() => onFontSizeChange(fontSize + 1)} title="Aumentar fonte">
          <ZoomIn />
        </Button>

        <Button variant="outline" size="icon" onClick={() => handleCopy(articleText)} title="Copiar artigo">
          <Copy />
        </Button>
      </div>
    </Card>;
};
export default ArticleCard;