
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface DicionarioItem {
  id: string;
  termo: string;
  definicao: string;
  exemplo_uso: string | null;
  area_direito: string | null;
}

const DicionarioJuridico = () => {
  const [dicionario, setDicionario] = useState<DicionarioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DicionarioItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    fetchDicionario();
  }, []);

  useEffect(() => {
    filterDicionario();
  }, [searchTerm, areaFilter, dicionario, activeTab, selectedLetter]);

  const fetchDicionario = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dicionario_juridico')
        .select('*')
        .order('termo');

      if (error) throw error;

      if (data) {
        setDicionario(data as DicionarioItem[]);
        
        // Extract unique areas - Fix the undefined iterable issue
        const uniqueAreas = [...new Set(data
          .map(item => item.area_direito)
          .filter(area => area !== null && area !== undefined))] as string[];
        
        setAreas(uniqueAreas);
      }
    } catch (error) {
      console.error('Error fetching dictionary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDicionario = () => {
    let filtered = [...dicionario];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item => item.termo.toLowerCase().includes(search) || 
                item.definicao.toLowerCase().includes(search)
      );
    }

    // Apply area filter
    if (areaFilter) {
      filtered = filtered.filter(item => item.area_direito === areaFilter);
    }

    // Apply letter filter
    if (selectedLetter) {
      filtered = filtered.filter(item => item.termo.toUpperCase().startsWith(selectedLetter));
    }

    setFilteredItems(filtered);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setAreaFilter('');
    setSelectedLetter(null);
    setActiveTab('todos');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col items-center mb-6">
        <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-center mb-1">Dicionário Jurídico</h1>
        <p className="text-muted-foreground text-center mb-6">
          Consulte termos e conceitos jurídicos
        </p>

        {/* Search and filters */}
        <div className="w-full max-w-3xl mx-auto mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar termos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Área do Direito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as áreas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alphabet filter */}
          <div className="flex flex-wrap justify-center gap-1">
            {alphabet.map(letter => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0 text-xs font-medium"
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </Button>
            ))}
          </div>

          {/* Active filters */}
          {(searchTerm || areaFilter || selectedLetter) && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              <div className="flex flex-wrap gap-1">
                {searchTerm && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Busca: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {areaFilter && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Área: {areaFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setAreaFilter('')} />
                  </Badge>
                )}
                {selectedLetter && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Letra: {selectedLetter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLetter(null)} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                  Limpar tudo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dictionary Content */}
        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="text-center p-12">Carregando dicionário...</div>
          ) : filteredItems.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent>
                <p className="mb-4">Nenhum termo encontrado com os filtros atuais.</p>
                <Button onClick={resetFilters}>Limpar filtros</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredItems.map((item) => (
                <Card key={item.id} className="transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">{item.termo}</CardTitle>
                    {item.area_direito && (
                      <Badge variant="outline" className="w-fit">
                        {item.area_direito}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p>{item.definicao}</p>
                  </CardContent>
                  {item.exemplo_uso && (
                    <CardFooter className="flex flex-col items-start border-t pt-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Exemplo:</span> {item.exemplo_uso}
                      </p>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DicionarioJuridico;
