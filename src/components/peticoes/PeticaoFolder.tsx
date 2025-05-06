
import React from "react";
import { motion } from "framer-motion";
import { Folder, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PeticaoFolderProps {
  area: string;
  total: number;
  color?: string;
  onClick: () => void;
  className?: string;
}

export function PeticaoFolder({ area, total, color = "#4f46e5", onClick, className }: PeticaoFolderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center p-4 bg-card/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:border-white/20 hover:shadow-xl",
        className
      )}
    >
      <div 
        className="relative mb-3 p-2 rounded-lg"
        style={{ color }}
      >
        <Folder className="h-14 w-14 text-current transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
        {total > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -right-2 -top-2 bg-white/90 text-black font-medium"
          >
            {total}
          </Badge>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-center line-clamp-2">{area}</h3>
      
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        <span>
          {total} {total === 1 ? 'documento' : 'documentos'}
        </span>
      </div>
    </motion.div>
  );
}
