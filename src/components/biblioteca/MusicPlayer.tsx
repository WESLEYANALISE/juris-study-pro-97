
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";

const RELAXING_SONGS = [
  {
    id: 1,
    title: "Clair de Lune",
    artist: "Claude Debussy",
    description: "Ajuda a melhorar o foco",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Debussy_-_Clair_de_Lune_%28piano_roll%29.ogg",
  },
  {
    id: 2,
    title: "Gymnopédie No 1",
    artist: "Erik Satie",
    description: "Diminui a ansiedade",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/90/Erik_Satie_-_gymnopédie_No.1.ogg",
  },
  {
    id: 3,
    title: "Weightless",
    artist: "Marconi Union",
    description: "Reduz tensão visual",
    url: "https://archive.org/download/TF041/marconi_union_-_01_-_weightless_part_1.mp3",
  },
  {
    id: 4,
    title: "Spiegel im Spiegel",
    artist: "Arvo Pärt",
    description: "Promove relaxamento profundo",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Arvo_Pärt_-_Spiegel_im_Spiegel.ogg",
  },
  {
    id: 5,
    title: "Moonlight Sonata (adagio)",
    artist: "Ludwig van Beethoven",
    description: "Melhora a concentração",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Ludwig_van_Beethoven_-_piano_sonata_No.14_in_C-sharp_minor_%28Moonlight%29%2C_Op.27_No.2_-_1._Adagio_sostenuto.ogg",
  },
];

interface MusicPlayerProps {
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(RELAXING_SONGS[0]);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeSong = (song: typeof RELAXING_SONGS[0]) => {
    setCurrentSong(song);
    setIsPlaying(false);
    
    // Use setTimeout to ensure state updates complete before playing
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
        setIsPlaying(true);
      }
    }, 50);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <motion.div
          className={`fixed bottom-20 right-4 z-50 ${className}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground"
          >
            <Music className="h-6 w-6" />
          </Button>
        </motion.div>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">Músicas Relaxantes</DrawerTitle>
          <p className="text-center text-sm text-muted-foreground">
            Melhore sua experiência de leitura com músicas calmas
          </p>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{currentSong.title}</h3>
                <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-primary"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Button
                  onClick={togglePlay}
                  variant="outline"
                  size="icon"
                  className="bg-primary text-primary-foreground h-10 w-10 rounded-full"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs italic text-muted-foreground">{currentSong.description}</p>
              <div className="mt-3">
                <audio
                  ref={audioRef}
                  src={currentSong.url}
                  onEnded={() => setIsPlaying(false)}
                >
                  Seu navegador não suporta o elemento de áudio.
                </audio>
                <div className="mt-2">
                  <p className="text-xs mb-1">Volume: {volume}%</p>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setVolume(value[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Playlist</h3>
            <div className="space-y-1">
              {RELAXING_SONGS.map((song) => (
                <div
                  key={song.id}
                  onClick={() => changeSong(song)}
                  className={`p-2 rounded-md hover:bg-accent cursor-pointer flex items-center justify-between ${
                    currentSong.id === song.id ? "bg-accent" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                  {currentSong.id === song.id && isPlaying && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="relative w-3 h-3">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MusicPlayer;
