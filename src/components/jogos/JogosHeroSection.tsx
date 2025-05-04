
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Puzzle, BookOpen, Award } from 'lucide-react';

export const JogosHeroSection = () => {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-800 p-8 md:p-12 shadow-xl">
      <div className="absolute inset-0 bg-texture-dots opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/0"></div>
      
      <motion.div 
        className="relative z-20 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-shadow">Jogos de Palavras</h1>
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-6">
          Aprimore seu vocabulário jurídico com jogos divertidos e educativos. Teste seus conhecimentos através de caça-palavras, palavras cruzadas, jogo da forca e outros desafios especialmente desenvolvidos para estudantes e profissionais do Direito.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: <Search className="h-6 w-6" />, text: "Encontre palavras" },
            { icon: <Puzzle className="h-6 w-6" />, text: "Resolva desafios" },
            { icon: <BookOpen className="h-6 w-6" />, text: "Aprenda jogando" },
            { icon: <Award className="h-6 w-6" />, text: "Ganhe conquistas" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-glass-darker backdrop-blur-lg rounded-xl p-4 flex flex-col items-center text-center border border-white/10 shadow-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.3)" }}
            >
              <div className="p-2 bg-primary/20 rounded-full mb-2">
                {item.icon}
              </div>
              <span className="mt-2 text-sm md:text-base font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
