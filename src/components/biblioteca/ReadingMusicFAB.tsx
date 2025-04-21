
import React, { useState, useRef } from "react";

const relaxingPlaylist = [
  { name: "Lo-Fi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Jazz Café", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Calm Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { name: "Nature Wave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { name: "Focus Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

const ReadingMusicFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = (idx: number) => {
    setCurrent(idx);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const handlePause = () => {
    audioRef.current?.pause();
  };

  return (
    <div className="fixed z-[80] bottom-4 right-4 md:bottom-7 md:right-7">
      <button
        className="rounded-full shadow-xl bg-primary text-white w-14 h-14 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Abrir playlist de leitura"
        style={{ boxShadow: "0 8px 32px rgba(80,35,147,0.22)" }}
      >
        <span role="img" aria-label="music">&#127925;</span>
      </button>
      {isOpen && (
        <div className="animate-fade-in mt-3 bg-background border rounded-lg shadow-lg p-4 w-[90vw] max-w-xs absolute bottom-16 right-0">
          <div className="mb-2 text-sm font-medium">🎶 Ouça músicas para relaxar e focar na leitura!</div>
          <ul className="space-y-2">
            {relaxingPlaylist.map((music, idx) => (
              <li key={music.name} className="flex items-center justify-between">
                <span className="truncate">{music.name}</span>
                <button
                  className={`ml-3 px-3 py-1 rounded-full text-xs ${
                    current === idx ? "bg-primary text-white" : "bg-muted text-foreground"
                  }`}
                  onClick={() => current === idx ? handlePause() : handlePlay(idx)}
                >
                  {current === idx ? "Pausar" : "Ouvir"}
                </button>
              </li>
            ))}
          </ul>
          {current !== null && (
            <audio
              ref={audioRef}
              src={relaxingPlaylist[current].url}
              autoPlay
              loop
              onEnded={() => setCurrent(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ReadingMusicFAB;
