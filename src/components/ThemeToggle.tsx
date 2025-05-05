import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { motion } from "framer-motion";
export function ThemeToggle() {
  const {
    theme
  } = useTheme();
  const handleClick = () => {
    toast.info("O modo escuro está ativado por padrão neste aplicativo", {
      description: "Personalize seu tema nas configurações de perfil.",
      icon: <Moon className="h-4 w-4" />
    });
  };
  return <motion.div whileTap={{
    scale: 0.95
  }}>
      <Button variant="ghost" size="icon" onClick={handleClick} className="relative w-9 h-9 rounded-full hover:bg-purple-900/20 transition-all duration-300">
        {/* App logo instead of scale icon */}
        
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>;
}