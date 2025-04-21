
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface BibliotecaHeaderProps {
  totalBooks: number;
  onOpenAnnotations: () => void;
}

const BibliotecaHeader: React.FC<BibliotecaHeaderProps> = ({ totalBooks, onOpenAnnotations }) => (
  <div className="mb-3 sm:mb-6 flex flex-col gap-3 sm:gap-0">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <BookOpen className="h-6 w-6 text-primary" />
        <div className="text-lg sm:text-xl font-semibold pl-2">Biblioteca Jurídica</div>
        <span className="text-xs sm:text-sm text-muted-foreground pl-2">
          <span className="font-semibold">{totalBooks}</span> livros disponíveis
        </span>
      </div>
      <Button variant="outline" onClick={onOpenAnnotations} className="hidden sm:inline-block ml-3">
        <span className="mr-2">Minhas Anotações</span>
      </Button>
    </div>
  </div>
);

export default BibliotecaHeader;
