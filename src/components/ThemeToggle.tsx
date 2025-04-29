
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export function ThemeToggle() {
  const { theme } = useTheme();
  
  const handleClick = () => {
    toast.info("O modo escuro está ativado por padrão neste aplicativo");
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleClick}
      title="Modo Escuro Ativado"
      aria-label="Alternar tema"
    >
      <Moon className="h-5 w-5 fill-foreground" />
    </Button>
  );
}
