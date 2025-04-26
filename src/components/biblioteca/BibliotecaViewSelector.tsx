
import { Button } from "@/components/ui/button";
import { Grid, Columns } from "lucide-react";
import { motion } from "framer-motion";

type ViewMode = "carousel" | "list";

interface BibliotecaViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function BibliotecaViewSelector({ currentView, onViewChange }: BibliotecaViewSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-2 bg-[#1d1d1d] p-1 rounded-lg"
    >
      <Button
        size="sm"
        variant={currentView === "carousel" ? "default" : "ghost"}
        onClick={() => onViewChange("carousel")}
        className={currentView === "carousel" ? "bg-red-600 hover:bg-red-700" : "text-white"}
      >
        <Columns size={16} className="mr-1" />
        Carrossel
      </Button>
      <Button
        size="sm" 
        variant={currentView === "list" ? "default" : "ghost"}
        onClick={() => onViewChange("list")}
        className={currentView === "list" ? "bg-red-600 hover:bg-red-700" : "text-white"}
      >
        <Grid size={16} className="mr-1" />
        Lista
      </Button>
    </motion.div>
  );
}
