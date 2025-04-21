
import React, { useRef, useState } from "react";
import { Music, Play, Pause } from "lucide-react";

const RELAX_MUSICS = [
  {
    title: "Clair de Lune",
    artist: "Claude Debussy",
    info: "ajuda a concentração",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12edb8e56a.mp3"
  },
  {
    title: "Gymnopédie No 1",
    artist: "Erik Satie",
    info: "reduz tensão visual",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12edb82be2.mp3"
  },
  {
    title: "Weightless",
    artist: "Marconi Union",
    info: "alivia o estresse",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12edb85cfa.mp3"
  },
  {
    title: "Spiegel im Spiegel",
    artist: "Arvo Pärt",
    info: "melhora foco",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12edb8003b.mp3"
  },
  {
    title: "Moonlight Sonata (adagio)",
    artist: "L. v. Beethoven",
    info: "acalma pensamentos",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_12edb84e2a.mp3"
  }
];

// O layout e urls podem ser trocados facilmente depois.

interface RelaxMusicPlayerProps {
  open: boolean;
  onClose: () => void;
}

const RelaxMusicPlayer: React.FC<RelaxMusicPlayerProps> = ({ open, onClose }) => {
  const [current, setCurrent] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play selected music
  const handlePlayPause = (idx: number) => {
    if (current !== idx) {
      setCurrent(idx);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, current]);

  // Auto-advance to next music if exists
  const handleEnded = () => {
    if (current !== null && current < RELAX_MUSICS.length - 1) {
      setCurrent(current + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrent(null);
    }
  };

  // Close resets music
  React.useEffect(() => {
    if (!open) {
      setCurrent(null);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed z-[60] left-0 right-0 bottom-0 pb-6 flex justify-center items-end pointer-events-none">
      <div
        className="w-full max-w-sm rounded-xl bg-background shadow-lg border p-4 mx-2 pointer-events-auto"
        style={{ animation: "fade-in 0.25s" }}
      >
        <div className="flex items-center gap-2 pb-2 mb-2 border-b text-primary font-semibold">
          <Music className="w-4 h-4 mr-1" />
          Relaxar & Concentração
          <button className="ml-auto p-1 text-muted-foreground rounded hover:bg-muted transition" onClick={onClose}>
            ✕
          </button>
        </div>
        <ul>
          {RELAX_MUSICS.map((trk, idx) => (
            <li key={trk.title} className="flex items-center py-1 px-2 rounded mb-1 hover:bg-muted transition">
              <button
                className="mr-2 rounded-full bg-primary/10 p-2"
                aria-label={isPlaying && current === idx ? "Pausar" : "Tocar"}
                onClick={() => handlePlayPause(idx)}
              >
                {isPlaying && current === idx ? <Pause /> : <Play />}
              </button>
              <div>
                <div className="text-sm font-medium">{trk.title}</div>
                <div className="text-xs text-muted-foreground">{trk.artist}</div>
                <div className="text-xs text-primary">{trk.info}</div>
              </div>
            </li>
          ))}
        </ul>
        <audio
          ref={audioRef}
          src={current !== null ? RELAX_MUSICS[current].url : undefined}
          onEnded={handleEnded}
        />
      </div>
    </div>
  );
};

export default RelaxMusicPlayer;
