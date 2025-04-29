
import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Link as LinkIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// Featured content items
const featuredItems = [
  {
    id: 101,
    nome: "O Julgamento de Chicago 7",
    ano: "2020",
    sinopse: "O filme retrata o julgamento dos manifestantes que protestaram contra a Guerra do Vietnã durante a Convenção Nacional Democrata de 1968.",
    nota: "8.5",
    plataforma: "Netflix",
    link: "https://www.netflix.com/title/81043755",
    capa: "https://m.media-amazon.com/images/M/MV5BYjYzOGE1MjUtODgyMy00ZDAxLTljYTgtNzk0Njg2YWQwMTZhXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
    beneficios: "Excelente para entender conceitos de direito processual e liberdade de expressão.",
    trailer: "https://www.youtube.com/embed/FVb6EdKDBfU",
    tipo: "filme",
    banner: "https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABcLMy38LgyoqX4Y0M95yCorfJ6rc7KTNtlOd8iKEncU2xaPKOVPbZ-JJLOBiQY_DBuGOux0HGIuDqdBUcGNVWQVef9tx0H8btKDN.jpg"
  },
  {
    id: 102,
    nome: "Luta por Justiça",
    ano: "2019",
    sinopse: "Bryan Stevenson, um advogado recém-formado em Harvard, vai para o Alabama defender pessoas condenadas erroneamente ou que não tiveram representação legal adequada.",
    nota: "7.6",
    plataforma: "Prime Video",
    link: "https://www.primevideo.com",
    capa: "https://m.media-amazon.com/images/I/71WrWhSuFjL._AC_UF1000,1000_QL80_.jpg",
    beneficios: "Mostra a realidade do sistema penal americano e a luta contra a injustiça racial.",
    trailer: "https://www.youtube.com/embed/GVQbeG5yW78",
    tipo: "filme",
    banner: "https://m.media-amazon.com/images/S/pv-target-images/9f8c51d788961664c801ce593c2a987e0fa8b95ec9b33c5f1cbe750cf9143d11.jpg"
  }
];

interface FeaturedContentProps {
  onSelectItem: (item: any) => void;
}

export function FeaturedContent({ onSelectItem }: FeaturedContentProps) {
  return (
    <motion.div 
      className="w-full mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[Pagination, Autoplay]}
        className="rounded-xl overflow-hidden h-[240px] sm:h-[320px] md:h-[400px]"
      >
        {featuredItems.map((item) => (
          <SwiperSlide key={item.id}>
            <Card className="h-full w-full border-0 overflow-hidden">
              <CardContent className="p-0 h-full relative">
                <img 
                  src={item.banner || item.capa} 
                  alt={item.nome} 
                  className="w-full h-full object-cover"
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Star size={16} className="fill-amber-400" />
                      {item.nota}
                    </span>
                    <span className="text-white/70 text-sm">
                      {item.ano} • {item.plataforma}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.nome}</h2>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2 md:line-clamp-3">
                    {item.sinopse}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => onSelectItem(item)} className="gap-2 bg-primary hover:bg-primary/90">
                      <Info size={16} />
                      Detalhes
                    </Button>
                    
                    <Button variant="outline" asChild>
                      <Link to={item.link} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <LinkIcon size={16} />
                        Assistir
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
