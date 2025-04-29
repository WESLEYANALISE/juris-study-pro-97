
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme } = useTheme();
  
  const handleClick = () => {
    toast.info("O modo escuro está ativado por padrão neste aplicativo", {
      description: "Personalize seu tema nas configurações de perfil.",
      icon: <Moon className="h-4 w-4" />
    });
  };
  
  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleClick} 
        title="Modo Escuro Ativado" 
        aria-label="Alternar tema"
        className="rounded-full bg-primary/10 text-primary hover:bg-primary/20"
      >
        <Moon className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}
