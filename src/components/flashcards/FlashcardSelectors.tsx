
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface FlashcardSelectorsProps {
  loading: boolean;
  areas: string[];
  temas: string[];
  selectedArea: string;
  selectedTema: string;
  onAreaChange: (value: string) => void;
  onTemaChange: (value: string) => void;
}

export const FlashcardSelectors = ({
  loading,
  areas,
  temas,
  selectedArea,
  selectedTema,
  onAreaChange,
  onTemaChange,
}: FlashcardSelectorsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-sm font-medium mb-1 block">Área do Direito</Label>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedArea} onValueChange={onAreaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma área" />
            </SelectTrigger>
            <SelectContent>
              {areas && areas.length > 0 ? (
                areas.map((area, index) => (
                  <SelectItem key={`${area}-${index}`} value={area}>
                    {area}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-areas" disabled>
                  Nenhuma área disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Tema</Label>
        {loading && selectedArea ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedTema} onValueChange={onTemaChange} disabled={!selectedArea}>
            <SelectTrigger>
              <SelectValue placeholder={selectedArea ? "Selecione um tema" : "Selecione uma área primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {temas && temas.length > 0 ? (
                temas.map((tema, index) => (
                  <SelectItem key={`${tema}-${index}`} value={tema}>
                    {tema}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-temas" disabled>
                  {selectedArea ? "Nenhum tema disponível" : "Selecione uma área primeiro"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
