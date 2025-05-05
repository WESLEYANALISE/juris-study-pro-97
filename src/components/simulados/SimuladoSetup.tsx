
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimuladoCategoria, SimuladoEdicao } from "@/types/simulados";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Clock, Calendar, BookOpen, AlertCircle } from "lucide-react";

interface SimuladoSetupProps {
  onStart: (config: {
    categoria: SimuladoCategoria;
    edicaoId: string;
  }) => void;
}

export const SimuladoSetup = ({
  onStart
}: SimuladoSetupProps) => {
  const [categoria, setCategoria] = useState<SimuladoCategoria>("OAB");
  const [edicaoId, setEdicaoId] = useState<string>("");
  const [edicoes, setEdicoes] = useState<SimuladoEdicao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ultimoExame, setUltimoExame] = useState<string | null>(null);

  // Fetch available editions when category changes
  useEffect(() => {
    const fetchEdicoes = async () => {
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from('simulado_edicoes').select('*').eq('categoria', categoria).order('ano', {
          ascending: false
        }).order('numero', {
          ascending: false
        });
        
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
    
    // Buscar informações sobre o último exame da OAB
    const fetchUltimoExame = async () => {
      try {
        // Consulta específica para exames da OAB
        if (categoria === 'OAB') {
          // Usando uma abordagem diferente para buscar o último exame da OAB
          // Buscamos o exame mais recente baseado na data
          const { data, error } = await supabase
            .from('simulado_edicoes')
            .select('nome, ano, numero')
            .eq('categoria', 'OAB')
            .order('ano', { ascending: false })
            .order('numero', { ascending: false })
            .limit(1);
            
          if (error) throw error;
          
          // Atualizar com dados reais se disponíveis
          if (data && data.length > 0) {
            const exame = data[0];
            setUltimoExame(`${exame.nome} (${exame.ano}/${exame.numero}) - Resultado em breve`);
          } else {
            setUltimoExame("XXXVIII Exame de Ordem - Previsto para Agosto 2025");
          }
        } else {
          setUltimoExame(null);
        }
      } catch (error) {
        console.error("Erro ao buscar informações do último exame:", error);
        setUltimoExame("Informações sobre o próximo exame não disponíveis");
      }
    };
    
    fetchEdicoes();
    fetchUltimoExame();
  }, [categoria]);

  const selectedEdicao = edicoes.find(e => e.id === edicaoId);
  
  // Corrigido: Este era o erro TS2367
  const categoriaDisponivel = (cat: SimuladoCategoria): boolean => {
    return cat === "OAB"; // Apenas OAB está disponível por enquanto
  };

  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Simulado {categoria}
        </CardTitle>
        <CardDescription>
          Prepare-se para o exame com questões reais de provas anteriores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={e => {
          e.preventDefault();
          onStart({
            categoria,
            edicaoId
          });
        }} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria do Simulado</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(["OAB", "JUIZ", "PROMOTOR", "DELEGADO", "PF", "PRF", "TJSP"] as SimuladoCategoria[]).map(cat => (
                <Button 
                  key={cat}
                  type="button"
                  variant={categoria === cat ? "default" : "outline"}
                  onClick={() => setCategoria(cat)}
                  className="justify-start gap-2 h-auto py-3"
                  disabled={!categoriaDisponivel(cat)}
                >
                  <div className="flex flex-col items-start">
                    <span>{cat}</span>
                    {!categoriaDisponivel(cat) && cat !== "OAB" && (
                      <Badge variant="secondary" className="mt-1 text-xs">Em breve</Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {ultimoExame && (
            <div className="bg-secondary/20 p-3 rounded-md text-sm border border-secondary/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Próximo Exame:</span>
              </div>
              <p className="mt-1">{ultimoExame}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Edição</Label>
            {loading ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner />
              </div>
            ) : (
              <Select value={edicaoId} onValueChange={setEdicaoId} disabled={edicoes.length === 0 || !categoriaDisponivel(categoria)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={edicoes.length === 0 ? "Nenhuma edição disponível" : "Selecione a edição"} />
                </SelectTrigger>
                <SelectContent>
                  {edicoes.map(edicao => (
                    <SelectItem key={edicao.id} value={edicao.id}>
                      {edicao.nome} ({edicao.ano}/{edicao.numero}) - {edicao.total_questoes} questões
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedEdicao && (
            <div className="bg-muted p-4 rounded-md text-sm border">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de questões:</span>
                  <span className="font-medium">{selectedEdicao.total_questoes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ano:</span>
                  <span className="font-medium">{selectedEdicao.ano}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edição:</span>
                  <span className="font-medium">{selectedEdicao.numero}</span>
                </div>
                
                {selectedEdicao.data_prova && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data da prova:</span>
                    <span className="font-medium">
                      {new Date(selectedEdicao.data_prova).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo estimado:</span>
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{Math.round(selectedEdicao.total_questoes * 3 / 60)} horas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!edicaoId || loading || !categoriaDisponivel(categoria)}>
            {categoriaDisponivel(categoria) ? "Iniciar Simulado" : "Em breve"}
          </Button>
          
          {!categoriaDisponivel(categoria) && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>Este simulado será disponibilizado em breve.</span>
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4 text-xs text-muted-foreground">
        Dados atualizados conforme disponibilizados pela OAB
      </CardFooter>
    </Card>
  );
};
