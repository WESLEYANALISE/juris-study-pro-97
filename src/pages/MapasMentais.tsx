import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";

interface MapaMental {
  id: number;
  area: string;
  mapa: string;
  link: string;
  created_at?: string;
  titulo?: string;
  descricao?: string;
  tags?: string[];
  imagem_url?: string;
  arquivo_url?: string;
}

const MapasMentais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const { data: mapasMentais = [], isLoading } = useQuery({
    queryKey: ["mapas_mentais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mapas_mentais")
        .select("*")
        .order("area");

      if (error) {
        console.error("Error fetching mapas mentais:", error);
        return [];
      }

      return (data || []) as unknown as MapaMental[];
    },
  });

  const areas = Array.from(
    new Set(mapasMentais.map((item) => item.area))
  ).filter(Boolean);

  const filteredMapas = mapasMentais.filter(
    (mapa) =>
      (!selectedArea || mapa.area === selectedArea) &&
      (!searchTerm ||
        mapa.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mapa.mapa && mapa.mapa.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Mapas Mentais</h1>
        <p className="text-muted-foreground">
          Explore mapas mentais para facilitar o aprendizado e a revisão de
          conteúdo jurídico.
        </p>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título ou descrição..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredMapas.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">Nenhum mapa mental encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar seus termos de busca ou filtros
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMapas.map((mapa) => (
              <Card key={mapa.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{mapa.titulo}</CardTitle>
                  <CardDescription>{mapa.area}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {mapa.descricao}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapasMentais;
