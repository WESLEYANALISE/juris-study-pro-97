
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DicionarioSearch } from "@/components/dicionario/DicionarioSearch";
import { DicionarioFilter } from "@/components/dicionario/DicionarioFilter";
import { PalavraDoDia } from "@/components/dicionario/PalavraDoDia";
import { TermosPopulares } from "@/components/dicionario/TermosPopulares";
import { TermosSearchResults } from "@/components/dicionario/TermosSearchResults";
import { useTermoView } from "@/hooks/use-termo-view";

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
  const [palavraDoDia, setPalavraDoDia] = useState<DicionarioTermo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const { trackView } = useTermoView();

  // Fetch terms and word of the day on component mount
  useEffect(() => {
    const fetchTermos = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('dicionario_juridico')
          .select('*')
          .order('termo');

        if (data) {
          setTermos(data);
          setFilteredTermos(data.slice(0, 10)); // Show first 10 by default
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPalavraDoDia = async () => {
      try {
        // Get a random term as word of the day
        // Using a deterministic approach based on the current date
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        
        // Use a hash function to get a deterministic "random" number from the date
        const hash = Array.from(dateString).reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
        }, 0);

        const { data: countData } = await supabase
          .from('dicionario_juridico')
          .select('id', { count: 'exact', head: true });

        if (countData) {
          // Fix: Ensure we have a numeric value for total by using the count property
          const total = countData.length || 1; // Fallback to 1 if length is 0
          // Get a deterministic index based on the hash and total count
          const index = Math.abs(hash) % total;
          
          const { data } = await supabase
            .from('dicionario_juridico')
            .select('*')
            .range(index, index);
          
          if (data && data.length > 0) {
            setPalavraDoDia(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching word of the day:', error);
      }
    };

    fetchTermos();
    fetchPalavraDoDia();
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

  const fetchMostViewedTerms = async () => {
    setIsLoadingPopular(true);
    try {
      // Get view counts for terms
      const { data: viewCounts } = await supabase
        .from('dicionario_termo_views')
        .select('termo_id')
        .limit(100);

      if (viewCounts && viewCounts.length > 0) {
        // Count occurrences of each termo_id in JavaScript
        const termCounts = viewCounts.reduce((acc: Record<string, number>, item: { termo_id: string }) => {
          acc[item.termo_id] = (acc[item.termo_id] || 0) + 1;
          return acc;
        }, {});
        
        // Sort by count and get top 5
        const topTermIds = Object.entries(termCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);
        
        if (topTermIds.length > 0) {
          // Fetch the actual term data for these IDs
          const { data: termData } = await supabase
            .from('dicionario_juridico')
            .select('*')
            .in('id', topTermIds);
  
          if (termData) {
            setMoreViewedTerms(termData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching popular terms:', error);
    } finally {
      setIsLoadingPopular(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (areas: string[]) => {
    setSelectedAreas(areas);
  };

  const handleTermoSelect = (termo: string) => {
    setSearchTerm(termo);
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTermoView = (termoId: string) => {
    trackView(termoId);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-6">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Dicionário Jurídico</h1>
          <p className="text-muted-foreground">
            Pesquise e descubra termos e definições do mundo jurídico
          </p>
        </header>

        {palavraDoDia && (
          <section className="mb-8">
            <PalavraDoDia termo={palavraDoDia} isLoading={false} />
          </section>
        )}

        <div className="flex items-center space-x-2">
          <DicionarioSearch 
            onSearch={handleSearch} 
            className="flex-grow" 
          />
          <DicionarioFilter onFilterChange={handleFilterChange} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">
              {searchTerm ? 'Resultados da pesquisa' : 'Termos jurídicos'}
              {filteredTermos.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredTermos.length} {filteredTermos.length === 1 ? 'termo' : 'termos'})
                </span>
              )}
            </h2>
            
            <TermosSearchResults
              termos={filteredTermos}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onTermoView={handleTermoView}
            />
          </div>

          <div>
            <TermosPopulares 
              termos={moreViewedTerms} 
              isLoading={isLoadingPopular}
              onTermoSelect={handleTermoSelect}
              className="sticky top-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dicionario;
