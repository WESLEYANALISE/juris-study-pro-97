
import { Book, BookOpen, Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type BibliotecaStats } from "@/types/biblioteca";
import { motion } from "framer-motion";

interface BibliotecaStatsProps {
  stats: BibliotecaStats;
}

export function BibliotecaStats({ stats }: BibliotecaStatsProps) {
  const areaKeys = Object.keys(stats.byArea).sort();

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-[#141414] border-[#2a2a2a] overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center mb-4">
              <Library className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-lg font-bold text-white">Estatísticas da Biblioteca</h2>
            </div>
            
            <div className="flex items-center justify-center p-2 mb-4 rounded-lg bg-[#1d1d1d]">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
                <span className="text-white/60 ml-2">livros no total</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {areaKeys.map(area => (
                <div 
                  key={area}
                  className="bg-[#1d1d1d] p-2 rounded-lg flex flex-col items-center"
                >
                  <span className="text-sm text-white/60">{area}</span>
                  <span className="text-xl font-bold text-white">{stats.byArea[area]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
