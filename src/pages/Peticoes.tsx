
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PeticaoSearch } from "@/components/peticoes/PeticaoSearch";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface Peticao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  arquivo_url: string;
  created_at?: string;
}

const Peticoes = () => {
  const [peticoes, setPeticoes] = useState<Peticao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPeticoes();
  }, []);

  const loadPeticoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("peticoes")
        .select("*");

      if (error) {
        throw error;
      }

      const mappedPeticoes = (data || []).map(item => ({
        id: item.id || '',
        titulo: item.tipo || '',
        descricao: item.descricao || '',
        categoria: item.area || '',
        arquivo_url: item.link || '',
        created_at: new Date().toISOString() // Default value since it may not exist
      }));

      setPeticoes(mappedPeticoes);
    } catch (error) {
      console.error("Error loading peticoes:", error);
      toast("Erro ao carregar petições");
    } finally {
      setLoading(false);
    }
  };

  const filteredPeticoes = peticoes.filter((peticao) =>
    peticao.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (arquivo_url: string) => {
    window.open(arquivo_url, "_blank");
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Petições e Modelos
        </h1>
        <p className="text-muted-foreground">
          Encontre modelos de petições para agilizar seu trabalho jurídico.
        </p>

        <PeticaoSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />

        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredPeticoes.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">Nenhuma petição encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar seus termos de busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeticoes.map((peticao) => (
              <Card key={peticao.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{peticao.titulo}</CardTitle>
                  <CardDescription>{peticao.categoria}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {peticao.descricao}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleDownload(peticao.arquivo_url)}
                    className="mt-auto w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Visualizar / Baixar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Peticoes;
