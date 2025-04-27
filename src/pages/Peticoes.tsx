
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { PeticaoFilters } from "@/components/peticoes/PeticaoFilters";
import { Peticao } from "@/types/peticoes";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Peticoes: React.FC = () => {
  const [peticoes, setPeticoes] = useState<Peticao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPeticoes, setFilteredPeticoes] = useState<Peticao[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [areas, setAreas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Define filter state variables
  const [areaFilter, setAreaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(undefined);
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  
  const itemsPerPage = 12;

  useEffect(() => {
    fetchPeticoes();
  }, []);

  const fetchPeticoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('peticoes').select('*');
      
      if (error) throw error;
      
      setPeticoes(data);
      setFilteredPeticoes(data);
      
      // Extract unique areas, tipos, and tags
      const uniqueAreas = [...new Set(data.map(p => p.sub_area || p.area))];
      const uniqueTipos = [...new Set(data.map(p => p.tipo))];
      
      // Extract all unique tags from petições
      const allTags = [...new Set(data.flatMap(p => p.tags || []))];
      
      setAreas(uniqueAreas);
      setTipos(uniqueTipos);
      setAllTags(allTags);
      
      // Calculate total pages
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      toast.success(`${data.length} petições carregadas com sucesso!`);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching petitions:', err);
      toast.error('Erro ao carregar petições');
      setError('Erro ao carregar petições');
      setLoading(false);
    }
  };

  const handleFilterChange = ({ area, tipo, search, dateFrom, dateTo, tags }: { 
    area?: string; 
    tipo?: string; 
    search?: string; 
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  }) => {
    // Update filter state variables
    setAreaFilter(area || '');
    setTipoFilter(tipo || '');
    setSearchFilter(search || '');
    setDateFromFilter(dateFrom);
    setDateToFilter(dateTo);
    setTagsFilter(tags || []);
    
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
        p.tipo.toLowerCase().includes(searchLower) ||
        p.area.toLowerCase().includes(searchLower) ||
        (p.sub_area && p.sub_area.toLowerCase().includes(searchLower)) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (dateFrom || dateTo) {
      filtered = filtered.filter(p => {
        if (!p.created_at) return false;
        
        const peticaoDate = new Date(p.created_at);
        
        if (dateFrom && dateTo) {
          return peticaoDate >= dateFrom && peticaoDate <= dateTo;
        }
        
        if (dateFrom) {
          return peticaoDate >= dateFrom;
        }
        
        if (dateTo) {
          return peticaoDate <= dateTo;
        }
        
        return true;
      });
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && tags.some(tag => p.tags!.includes(tag))
      );
    }

    setFilteredPeticoes(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };
  
  const resetFilters = () => {
    setAreaFilter('');
    setTipoFilter('');
    setSearchFilter('');
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
    setTagsFilter([]);
    handleFilterChange({});
  };

  const paginatedPeticoes = filteredPeticoes.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 mb-4 text-primary" />
        <p className="text-muted-foreground">Carregando petições...</p>
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
      <Toaster />
      
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Peticionário Jurídico</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Peticionário Jurídico</h1>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-muted-foreground">
              {filteredPeticoes.length} petições encontradas
            </span>
            <Badge className="bg-primary">
              <Filter className="h-3 w-3 mr-1" />
              Filtros ativos: {
                (areaFilter ? 1 : 0) + 
                (tipoFilter ? 1 : 0) + 
                (searchFilter ? 1 : 0) + 
                ((dateFromFilter || dateToFilter) ? 1 : 0) +
                (tagsFilter && tagsFilter.length > 0 ? 1 : 0)
              }
            </Badge>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <PeticaoFilters 
          areas={areas} 
          tipos={tipos} 
          onFilterChange={handleFilterChange} 
          availableTags={allTags}
        />
      </motion.div>

      {filteredPeticoes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 border border-dashed rounded-lg bg-background"
        >
          <div className="text-muted-foreground mb-4">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
            Nenhuma petição corresponde aos filtros selecionados
          </div>
          <Button onClick={resetFilters}>Limpar Filtros</Button>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedPeticoes.map((peticao) => (
              <motion.div key={peticao.id} variants={item}>
                <PeticaoCard peticao={peticao} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Peticoes;
