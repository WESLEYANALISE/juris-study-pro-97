
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimuladoCategoria, SimuladoEdicao } from "@/types/simulados";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SimuladoSetupProps {
  onStart: (config: { categoria: SimuladoCategoria; edicaoId: string }) => void;
}

export const SimuladoSetup = ({ onStart }: SimuladoSetupProps) => {
  const [categoria, setCategoria] = useState<SimuladoCategoria>("OAB");
  const [edicaoId, setEdicaoId] = useState<string>("");
  const [edicoes, setEdicoes] = useState<SimuladoEdicao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Fetch available editions when category changes
  useEffect(() => {
    const fetchEdicoes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('simulado_edicoes')
          .select('*')
          .eq('categoria', categoria)
          .order('ano', { ascending: false })
          .order('numero', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setEdicoes(data as SimuladoEdicao[]);
          setEdicaoId(data[0].id); // Select the most recent edition by default
        } else {
          setEdicoes([]);
          setEdicaoId("");
        }
      } catch (error) {
        console.error("Erro ao buscar edições:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEdicoes();
  }, [categoria]);

  const selectedEdicao = edicoes.find(e => e.id === edicaoId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Simulado</CardTitle>
        <CardDescription>
          Escolha a categoria e a edição da prova
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onStart({ categoria, edicaoId });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={categoria}
              onValueChange={(value) => setCategoria(value as SimuladoCategoria)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OAB">OAB</SelectItem>
                <SelectItem value="PRF">PRF</SelectItem>
                <SelectItem value="PF">PF</SelectItem>
                <SelectItem value="TJSP">TJSP</SelectItem>
                <SelectItem value="JUIZ">JUIZ</SelectItem>
                <SelectItem value="PROMOTOR">PROMOTOR</SelectItem>
                <SelectItem value="DELEGADO">DELEGADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Edição</Label>
            {loading ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner />
              </div>
            ) : (
              <Select
                value={edicaoId}
                onValueChange={setEdicaoId}
                disabled={edicoes.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={edicoes.length === 0 ? "Nenhuma edição disponível" : "Selecione a edição"} />
                </SelectTrigger>
                <SelectContent>
                  {edicoes.map((edicao) => (
                    <SelectItem key={edicao.id} value={edicao.id}>
                      {edicao.nome} ({edicao.ano}/{edicao.numero}) - {edicao.total_questoes} questões
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedEdicao && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>Total de questões: {selectedEdicao.total_questoes}</p>
              <p>Ano: {selectedEdicao.ano}</p>
              <p>Número: {selectedEdicao.numero}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={!edicaoId || loading}
          >
            Iniciar Simulado
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
