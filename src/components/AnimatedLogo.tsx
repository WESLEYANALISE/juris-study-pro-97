
import { Scale } from "lucide-react";
import { useEffect, useState } from "react";

const AnimatedLogo = ({ size = "large" }: { size?: "small" | "medium" | "large" }) => {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    // Create pulsing effect
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Size mappings
  const sizeMap = {
    small: { icon: "h-6 w-6", container: "p-2", text: "text-sm" },
    medium: { icon: "h-8 w-8", container: "p-2.5", text: "text-base" },
    large: { icon: "h-10 w-10", container: "p-3", text: "text-lg" }
  };
  
  const { icon, container, text } = sizeMap[size];
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${container} rounded-full bg-gradient-to-br from-primary/80 to-primary/30 mb-2`}>
        <Scale className={`${icon} text-white drop-shadow-md relative z-10`} />
        <div 
          className={`absolute inset-0 rounded-full bg-primary/30 transition-all duration-1000 ease-in-out ${pulse ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`} 
        />
      </div>
      <h1 className={`font-bold ${text} text-primary mb-0 whitespace-nowrap`}>JurisLab</h1>
    </div>
  );
};

export default AnimatedLogo;
