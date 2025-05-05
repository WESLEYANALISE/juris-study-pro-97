
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DicionarioSearch } from "@/components/dicionario/DicionarioSearch";
import { DicionarioFilter } from "@/components/dicionario/DicionarioFilter";
import { PalavraDoDia } from "@/components/dicionario/PalavraDoDia";
import { TermosPopulares } from "@/components/dicionario/TermosPopulares";
import { TermosSearchResults } from "@/components/dicionario/TermosSearchResults";
import { useTermoView } from "@/hooks/use-termo-view";
import { AlphabeticIndex } from "@/components/dicionario/AlphabeticIndex";
import { useQuery } from "@tanstack/react-query";

interface DicionarioTermo {
  id: string;
  termo: string;
  definicao: string;
  exemplo_uso: string | null;
  area_direito: string | null;
}

const Dicionario: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { trackView } = useTermoView();

  // Fetch all dictionary terms with React Query
  const { 
    data: termos = [], 
    isLoading 
  } = useQuery({
    queryKey: ['dicionario-juridico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dicionario_juridico')
        .select('*')
        .order('termo');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Fetch word of the day using React Query
  const { 
    data: palavraDoDia, 
    isLoading: isLoadingPalavraDoDia 
  } = useQuery({
    queryKey: ['palavra-do-dia'],
    queryFn: async () => {
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

      if (!countData) return null;
      
      // Fix: Ensure we have a numeric value for total by using the count property
      const total = countData.length || 1; // Fallback to 1 if length is 0
      // Get a deterministic index based on the hash and total count
      const index = Math.abs(hash) % total;
      
      const { data } = await supabase
        .from('dicionario_juridico')
        .select('*')
        .range(index, index);
      
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours cache
  });

  // Fetch most viewed terms with React Query
  const { 
    data: moreViewedTerms = [], 
    isLoading: isLoadingPopular 
  } = useQuery({
    queryKey: ['termos-populares'],
    queryFn: async () => {
      // Get view counts for terms
      const { data: viewCounts } = await supabase
        .from('dicionario_termo_views')
        .select('termo_id')
        .limit(100);

      if (!viewCounts || viewCounts.length === 0) return [];

      // Count occurrences of each termo_id
      const termCounts = viewCounts.reduce((acc: Record<string, number>, item: { termo_id: string }) => {
        acc[item.termo_id] = (acc[item.termo_id] || 0) + 1;
        return acc;
      }, {});
      
      // Sort by count and get top 5
      const topTermIds = Object.entries(termCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);
      
      if (topTermIds.length === 0) return [];
      
      // Fetch the actual term data for these IDs
      const { data: termData } = await supabase
        .from('dicionario_juridico')
        .select('*')
        .in('id', topTermIds);

      return termData || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Get available first letters for the alphabet index
  const availableLetters = useMemo(() => {
    return [...new Set(termos.map(termo => 
      termo.termo.charAt(0).toUpperCase()
    ))].sort();
  }, [termos]);

  // Filter terms based on search, area, and letter
  const filteredTermos = useMemo(() => {
    return termos.filter(termo => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        termo.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        termo.definicao.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by selected areas
      const matchesArea = selectedAreas.length === 0 || (
        termo.area_direito && 
        selectedAreas.some(area => 
          termo.area_direito?.split(',').map(a => a.trim()).includes(area)
        )
      );
      
      // Filter by selected letter
      const matchesLetter = !selectedLetter || 
        termo.termo.charAt(0).toUpperCase() === selectedLetter;
      
      return matchesSearch && matchesArea && matchesLetter;
    });
  }, [termos, searchTerm, selectedAreas, selectedLetter]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedLetter(null);
  }, []);

  const handleFilterChange = useCallback((areas: string[]) => {
    setSelectedAreas(areas);
  }, []);

  const handleLetterSelect = useCallback((letter: string) => {
    setSelectedLetter(letter || null);
    // If a letter is selected, clear the search term
    if (letter) {
      setSearchTerm('');
    }
  }, []);

  const handleTermoSelect = useCallback((termo: string) => {
    setSearchTerm(termo);
    setSelectedLetter(null);
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTermoView = useCallback((termoId: string) => {
    trackView(termoId);
  }, [trackView]);

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
            <PalavraDoDia termo={palavraDoDia} isLoading={isLoadingPalavraDoDia} />
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
              {searchTerm 
                ? 'Resultados da pesquisa' 
                : selectedLetter 
                  ? `Termos com a letra "${selectedLetter}"` 
                  : 'Termos jurídicos'
              }
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

          <div className="space-y-6">
            <AlphabeticIndex 
              onSelectLetter={handleLetterSelect}
              currentLetter={selectedLetter}
              availableLetters={availableLetters}
              className="mb-6 sticky top-24"
            />

            <TermosPopulares 
              termos={moreViewedTerms} 
              isLoading={isLoadingPopular}
              onTermoSelect={handleTermoSelect}
              className="sticky top-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dicionario;
