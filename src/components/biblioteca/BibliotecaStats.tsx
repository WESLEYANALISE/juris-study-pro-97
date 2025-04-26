
import { Library, BookOpen, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type BibliotecaStats } from "@/types/biblioteca";
import { motion } from "framer-motion";

interface BibliotecaStatsProps {
  stats: BibliotecaStats;
  userStats?: {
    livros_lidos: number;
    flashcards_estudados: number;
    videos_assistidos: number;
  } | null;
}

export function BibliotecaStats({ stats, userStats }: BibliotecaStatsProps) {
  const areaKeys = Object.keys(stats.byArea).sort();

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-[#1E1E1E] border-[#2C2C2C] overflow-hidden">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#121212] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#D32F2F] mb-2">
                  <Library className="h-5 w-5" />
                  <h3 className="font-medium text-sm">Total de Livros</h3>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              
              <div className="bg-[#121212] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#D32F2F] mb-2">
                  <BookOpen className="h-5 w-5" />
                  <h3 className="font-medium text-sm">Áreas</h3>
                </div>
                <p className="text-2xl font-bold text-white">{areaKeys.length}</p>
              </div>
              
              {userStats && (
                <>
                  <div className="bg-[#121212] p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-[#D32F2F] mb-2">
                      <Users className="h-5 w-5" />
                      <h3 className="font-medium text-sm">Livros Lidos</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {userStats.livros_lidos || 0}
                    </p>
                  </div>
                  
                  <div className="bg-[#121212] p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-[#D32F2F] mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <h3 className="font-medium text-sm">Progresso</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {Math.round((userStats.livros_lidos || 0) / stats.total * 100)}%
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {areaKeys.map(area => (
                <div 
                  key={area}
                  className="bg-[#121212] p-2 rounded-lg"
                >
                  <span className="text-sm text-[#B0B0B0] block truncate">{area}</span>
                  <span className="text-lg font-bold text-white">{stats.byArea[area]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
