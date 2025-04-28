import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MapaMental {
  id: string;
  titulo: string;
  descricao: string;
  area: string;
  tags: string[];
  imagem_url: string;
  arquivo_url: string;
  created_at: string;
}

const MapasMentais = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const { data: mapas = [], isLoading } = useQuery({
    queryKey: ["mapas_mentais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mapas_mentais")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mapas mentais:", error);
        return [];
      }

      return data as MapaMental[];
    },
  });

  const uniqueAreas = Array.from(
    new Set(mapas.map(mapa => mapa.area?.toString() || ""))
  ).filter(Boolean) as string[];

  const uniqueTags = Array.from(
    new Set(mapas.flatMap(mapa => (mapa.tags || []).map(tag => tag?.toString() || "")))
  ).filter(Boolean) as string[];

  const filteredMapas = mapas.filter((mapa) => {
    const matchesSearch =
      searchQuery === "" ||
      mapa.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapa.descricao?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = areaFilter === "" || mapa.area === areaFilter;

    const matchesTag = tagFilter === "" || mapa.tags?.includes(tagFilter);

    return matchesSearch && matchesArea && matchesTag;
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">Todas as tags</option>
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
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
