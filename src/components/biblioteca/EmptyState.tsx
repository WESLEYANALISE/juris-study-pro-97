
import { BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "recent" | "recommended";
  onExplore: () => void;
}

export function EmptyState({ type, onExplore }: EmptyStateProps) {
  return (
    <div className="text-center py-10">
      {type === "recent" ? (
        <>
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
          <p className="text-muted-foreground">Você ainda não visualizou nenhum livro</p>
        </>
      ) : (
        <>
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
          <p className="text-muted-foreground">Continue explorando para receber recomendações personalizadas</p>
        </>
      )}
      <Button 
        variant="link" 
        onClick={onExplore}
        className="mt-2"
      >
        {type === "recent" ? "Explore a biblioteca" : "Explorar mais livros"}
      </Button>
    </div>
  );
}
