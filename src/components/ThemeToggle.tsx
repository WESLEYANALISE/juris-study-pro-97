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
      
    </motion.div>;
}