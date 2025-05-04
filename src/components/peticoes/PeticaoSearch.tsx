
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PeticaoSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeticaoSearch({ value, onChange }: PeticaoSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="search"
        placeholder="Buscar petições por título, tipo ou área..."
        className="pl-10 bg-card/30 backdrop-blur-sm border-white/5 shadow-inner"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
