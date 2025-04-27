
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Livro {
  id: string;
  nome: string;
  categoria: string;
  capa_url?: string;
  descricao?: string;
  total_paginas?: number;
}

export default function BibliotecaRecomendacoes() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLivros();
  }, []);

  const fetchLivros = async () => {
    const { data, error } = await supabase
      .from('livrospro')
      .select('*');

    if (error) {
      console.error('Erro ao carregar livros:', error);
      return;
    }

    setLivros(data);
    const uniqueCategorias = [...new Set(data.map(livro => livro.categoria))];
    setCategorias(uniqueCategorias);
  };

  const filteredLivros = livros.filter(livro => {
    const matchesSearch = livro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         livro.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || livro.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Recomendações</h1>
          <p className="text-muted-foreground">
            Explore nossa coleção de livros jurídicos
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar livros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLivros.map((livro) => (
            <Card key={livro.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-[3/4] relative mb-4 bg-muted rounded-lg overflow-hidden">
                  {livro.capa_url ? (
                    <img
                      src={livro.capa_url}
                      alt={livro.nome}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="h-20 w-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle>{livro.nome}</CardTitle>
                <CardDescription>{livro.categoria}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {livro.descricao || "Sem descrição disponível"}
                </p>
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/biblioteca/${livro.id}`)}
                >
                  Ler agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
