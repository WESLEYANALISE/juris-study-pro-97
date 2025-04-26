
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Volume2, Copy, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { toast } from "@/hooks/use-toast";

interface DicionarioTermo {
  id: string;
  termo: string;
  definicao: string;
  exemplo_uso: string | null;
  area_direito: string | null;
}

const Dicionario: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [termos, setTermos] = useState<DicionarioTermo[]>([]);
  const [filteredTermos, setFilteredTermos] = useState<DicionarioTermo[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [moreViewedTerms, setMoreViewedTerms] = useState<DicionarioTermo[]>([]);

  // Fetch terms and track view on component mount
  useEffect(() => {
    const fetchTermos = async () => {
      const { data, error } = await supabase
        .from('dicionario_juridico')
        .select('*');

      if (data) {
        setTermos(data);
        setFilteredTermos(data);
      }
    };

    const fetchMostViewedTerms = async () => {
      // Query to get most viewed terms directly
      const { data: viewData } = await supabase
        .from('dicionario_termo_views')
        .select('termo_id, count(*)')
        .order('count', { ascending: false })
        .limit(5);

      if (viewData && viewData.length > 0) {
        // Extract term IDs
        const ids = viewData.map(item => item.termo_id);
        
        // Fetch the actual term data for these IDs
        const { data: termData } = await supabase
          .from('dicionario_juridico')
          .select('*')
          .in('id', ids);

        if (termData) {
          setMoreViewedTerms(termData);
        }
      }
    };

    fetchTermos();
    fetchMostViewedTerms();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = termos;

    if (searchTerm) {
      filtered = filtered.filter(termo => 
        termo.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        termo.definicao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAreas.length > 0) {
      filtered = filtered.filter(termo => 
        termo.area_direito && 
        selectedAreas.some(area => 
          termo.area_direito?.split(',').map(a => a.trim()).includes(area)
        )
      );
    }

    setFilteredTermos(filtered);
  }, [searchTerm, selectedAreas, termos]);

  const handleTextToSpeech = (text: string) => {
    TextToSpeechService.speak(text);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Texto copiado!",
      description: "O texto foi copiado para a área de transferência."
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-2 mb-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Buscar termo jurídico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3 text-muted-foreground" />
        </div>
        <Button variant="outline" size="icon">
          <Filter />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ScrollArea className="h-[70vh] pr-4">
            {filteredTermos.map((termo) => (
              <div 
                key={termo.id} 
                className="bg-card border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
                  {termo.termo}
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleTextToSpeech(termo.definicao)}
                    >
                      <Volume2 />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleCopyText(termo.definicao)}
                    >
                      <Copy />
                    </Button>
                  </div>
                </h2>
                <p className="mb-2">{termo.definicao}</p>
                {termo.exemplo_uso && (
                  <div className="bg-muted p-2 rounded">
                    <strong>Exemplo de uso:</strong> {termo.exemplo_uso}
                  </div>
                )}
                {termo.area_direito && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {termo.area_direito.split(',').map((area) => (
                      <span 
                        key={area} 
                        className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                      >
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Termos Mais Vistos</h3>
          <ScrollArea className="h-[70vh]">
            {moreViewedTerms.map((termo) => (
              <div 
                key={termo.id} 
                className="bg-card border rounded-lg p-3 mb-2 hover:bg-accent transition-colors"
              >
                <h4 className="font-medium">{termo.termo}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {termo.definicao}
                </p>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Dicionario;
