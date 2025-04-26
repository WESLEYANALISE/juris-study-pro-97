
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Film, 
  TvIcon, 
  Video, 
  Search,
  Youtube,
  Star,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface JurisFlixItem {
  id: number;
  nome: string;
  ano: string;
  sinopse: string;
  nota: string;
  plataforma: string;
  link: string;
  capa: string;
  beneficios: string;
  trailer: string;
  tipo: string;
}

const mockData: JurisFlixItem[] = [
  {
    id: 1,
    nome: "O Julgamento de Chicago 7",
    ano: "2020",
    sinopse: "O filme retrata o julgamento dos manifestantes que protestaram contra a Guerra do Vietnã durante a Convenção Nacional Democrata de 1968.",
    nota: "8.5",
    plataforma: "Netflix",
    link: "https://www.netflix.com/title/81043755",
    capa: "https://m.media-amazon.com/images/M/MV5BYjYzOGE1MjUtODgyMy00ZDAxLTljYTgtNzk0Njg2YWQwMTZhXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
    beneficios: "Excelente para entender conceitos de direito processual e liberdade de expressão.",
    trailer: "https://www.youtube.com/embed/FVb6EdKDBfU",
    tipo: "filme"
  },
  {
    id: 2,
    nome: "Justiça Sem Limites",
    ano: "2019",
    sinopse: "Série que aborda casos jurídicos complexos e dilemas éticos enfrentados por advogados.",
    nota: "7.9",
    plataforma: "Amazon Prime",
    link: "https://www.primevideo.com",
    capa: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB9I1XGPVhUmlnZ6X0Fzy4nyrFNvZIZTAQiq4pKtbYQt2H5XAYMbjPwYpxqhu8axyDBuo&usqp=CAU",
    beneficios: "Apresenta casos de diversas áreas do direito e discute ética profissional.",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tipo: "serie"
  }
];

const JurisFlix = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<JurisFlixItem | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Query com configuração aprimorada para debugging
  const { data: items = [], isLoading, error, isError } = useQuery({
    queryKey: ["jurisflix"],
    queryFn: async () => {
      console.log("Fetching JurisFlix data from Supabase...");
      try {
        const { data, error } = await supabase
          .from("Jurisflix")
          .select("*");

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Supabase returned data:", data);
        
        if (!data || data.length === 0) {
          console.log("No data returned from Supabase, using mock data");
          setUseMockData(true);
          return mockData;
        }
        
        return data as JurisFlixItem[];
      } catch (error) {
        console.error("Error fetching JurisFlix data:", error);
        toast.error("Erro ao carregar dados. Usando dados locais.");
        setUseMockData(true);
        return mockData;
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Efeito para verificar conexão do Supabase e mostrar toast se houver erro
  useEffect(() => {
    if (isError && error) {
      console.error("JurisFlix query error:", error);
      toast.error("Erro ao carregar conteúdo. Verifique sua conexão.");
    }
  }, [isError, error]);

  // Dados a serem exibidos (reais ou mock)
  const displayData = useMockData ? mockData : items;

  const filteredItems = displayData.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || item.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "filme":
        return <Film className="h-5 w-5" />;
      case "serie":
        return <TvIcon className="h-5 w-5" />;
      case "documentário":
        return <Video className="h-5 w-5" />;
      default:
        return <Film className="h-5 w-5" />;
    }
  };

  const getTypeButton = (tipo: string) => (
    <Button
      variant={selectedType === tipo ? "default" : "outline"}
      onClick={() => setSelectedType(selectedType === tipo ? null : tipo)}
      className="flex items-center gap-2"
    >
      {getIcon(tipo)}
      {tipo}
    </Button>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-center">JurisFlix</h1>
        <p className="text-center text-muted-foreground">
          Descubra filmes, séries e documentários jurídicos
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {getTypeButton("filme")}
            {getTypeButton("serie")}
            {getTypeButton("documentário")}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg aspect-[2/3]" />
              <div className="space-y-2 mt-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all duration-200"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item.capa}
                alt={item.nome}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 p-4 text-white">
                  <h3 className="font-bold">{item.nome}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{item.ano}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {item.nota}
                    </span>
                  </div>
                  <span className="inline-block mt-1 text-xs bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {item.plataforma}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo encontrado</h3>
          <p className="text-muted-foreground max-w-md">
            Não encontramos nenhum conteúdo com os filtros atuais. Tente ajustar sua busca ou remover filtros.
          </p>
          {selectedType && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedType(null)}
            >
              Limpar filtro de tipo
            </Button>
          )}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video relative">
                {selectedItem.trailer ? (
                  <iframe
                    src={selectedItem.trailer.replace('watch?v=', 'embed/')}
                    title={`Trailer de ${selectedItem.nome}`}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <Youtube className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{selectedItem.nome}</h2>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4" />
                    {selectedItem.nota}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm bg-muted px-2 py-1 rounded-full">
                    {selectedItem.ano}
                  </span>
                  <span className="text-sm bg-muted px-2 py-1 rounded-full">
                    {selectedItem.tipo}
                  </span>
                  <span className="text-sm bg-muted px-2 py-1 rounded-full">
                    {selectedItem.plataforma}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Sinopse</h3>
                    <p className="text-muted-foreground">{selectedItem.sinopse}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Benefícios Educacionais</h3>
                    <p className="text-muted-foreground">{selectedItem.beneficios}</p>
                  </div>

                  {selectedItem.link && (
                    <Button 
                      className="w-full"
                      onClick={() => window.open(selectedItem.link, '_blank')}
                    >
                      Assistir na {selectedItem.plataforma}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rodapé de informação quando dados mock estão sendo usados */}
      {useMockData && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800 dark:text-amber-300">
            Exibindo dados de demonstração. Alguns recursos podem estar limitados.
          </p>
        </div>
      )}
    </div>
  );
};

export default JurisFlix;
