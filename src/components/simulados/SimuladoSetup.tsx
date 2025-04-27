
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimuladoCategoria } from "@/types/simulados";

interface SimuladoSetupProps {
  onStart: (config: { categoria: SimuladoCategoria; questoes: number }) => void;
}

export const SimuladoSetup = ({ onStart }: SimuladoSetupProps) => {
  const [categoria, setCategoria] = useState<SimuladoCategoria>("OAB");
  const [questoes, setQuestoes] = useState(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Simulado</CardTitle>
        <CardDescription>
          Escolha a categoria e o número de questões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onStart({ categoria, questoes });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Categoria</Label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as SimuladoCategoria)}
              className="w-full p-2 border rounded-md"
            >
              <option value="OAB">OAB</option>
              <option value="PRF">PRF</option>
              <option value="PF">PF</option>
              <option value="TJSP">TJSP</option>
              <option value="JUIZ">JUIZ</option>
              <option value="PROMOTOR">PROMOTOR</option>
              <option value="DELEGADO">DELEGADO</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Número de Questões</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={questoes}
              onChange={(e) => setQuestoes(parseInt(e.target.value))}
            />
          </div>

          <Button type="submit" className="w-full">
            Iniciar Simulado
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
