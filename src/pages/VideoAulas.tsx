
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, Video, MessageSquare, ChevronRight } from "lucide-react";

export default function VideoAulas() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-3">Vídeo-aulas</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Escolha entre nossas modalidades de vídeo-aulas para uma experiência de aprendizado personalizada
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden bg-gradient-to-br from-card to-card/70">
            <CardContent className="p-6">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Video className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-center mb-3">Vídeo-aulas Tradicionais</h2>
              <p className="text-muted-foreground text-center mb-6">
                Acesse nossa biblioteca completa de vídeo-aulas organizadas por área do direito. 
                Aprenda no seu próprio ritmo com conteúdo de qualidade.
              </p>
              <Button 
                className="w-full min-h-[44px] gap-2 group" 
                onClick={() => navigate("/videoaulas/tradicionais")}
              >
                <Play className="h-4 w-4" />
                Acessar Vídeo-aulas
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden bg-gradient-to-br from-card to-card/70">
            <CardContent className="p-6">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-center mb-3">Vídeo-aulas Interativas</h2>
              <p className="text-muted-foreground text-center mb-6">
                Uma experiência única de aprendizado com perguntas automáticas durante os vídeos 
                para testar seu conhecimento em tempo real.
              </p>
              <Button 
                className="w-full min-h-[44px] gap-2 group" 
                onClick={() => navigate("/videoaulas-interativas")}
              >
                <Play className="h-4 w-4" />
                Acessar Vídeo-aulas Interativas
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="text-center mt-8 pt-4">
        <p className="text-muted-foreground mb-4">
          Não sabe por onde começar? Veja nossas sugestões personalizadas:
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/videoaulas/recomendacoes")}
        >
          Ver recomendações
        </Button>
      </div>
    </div>
  );
}
