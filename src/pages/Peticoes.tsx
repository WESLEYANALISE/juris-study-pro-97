
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { PeticaoFilters } from "@/components/peticoes/PeticaoFilters";
import { Peticao } from "@/types/peticoes";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";

const Peticoes: React.FC = () => {
  const [peticoes, setPeticoes] = useState<Peticao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPeticoes, setFilteredPeticoes] = useState<Peticao[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const [areas, setAreas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);

  useEffect(() => {
    fetchPeticoes();
  }, []);

  const fetchPeticoes = async () => {
    try {
      const { data, error } = await supabase.from('peticoes').select('*');
      
      if (error) throw error;
      
      setPeticoes(data);
      setFilteredPeticoes(data);
      
      // Extract unique areas and tipos
      const uniqueAreas = [...new Set(data.map(p => p.sub_area || p.area))];
      const uniqueTipos = [...new Set(data.map(p => p.tipo))];
      
      setAreas(uniqueAreas);
      setTipos(uniqueTipos);
      
      // Calculate total pages
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching petitions:', err);
      setError('Erro ao carregar petições');
      setLoading(false);
    }
  };

  const handleFilterChange = ({ area, tipo, search }: { 
    area?: string; 
    tipo?: string; 
    search?: string 
  }) => {
    let filtered = peticoes;

    if (area) {
      filtered = filtered.filter(p => 
        p.sub_area === area || p.area === area
      );
    }

    if (tipo) {
      filtered = filtered.filter(p => p.tipo === tipo);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.descricao.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredPeticoes(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const paginatedPeticoes = filteredPeticoes.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-12">
        {error}
        <Button onClick={fetchPeticoes} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Peticionário Jurídico</h1>
      
      <PeticaoFilters 
        areas={areas} 
        tipos={tipos} 
        onFilterChange={handleFilterChange} 
      />

      {filteredPeticoes.length === 0 ? (
        <div className="text-center text-muted-foreground mt-12">
          Nenhuma petição encontrada
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPeticoes.map((peticao) => (
              <PeticaoCard key={peticao.id} peticao={peticao} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Peticoes;
