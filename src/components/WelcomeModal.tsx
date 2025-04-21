
import { useState, useEffect } from "react";
import { Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type ProfileType = "concurseiro" | "universitario" | "advogado" | "oab" | "tudo";

interface ProfileOption {
  id: ProfileType;
  title: string;
  description: string;
}

const profileOptions: ProfileOption[] = [
  {
    id: "concurseiro",
    title: "Concurseiro",
    description: "Preparação para concursos públicos da área jurídica",
  },
  {
    id: "universitario",
    title: "Universitário",
    description: "Estudante de graduação em Direito",
  },
  {
    id: "advogado",
    title: "Advogado",
    description: "Profissional da advocacia em exercício",
  },
  {
    id: "oab",
    title: "Candidato OAB",
    description: "Preparação específica para Exame da Ordem",
  },
  {
    id: "tudo",
    title: "Acesso Completo",
    description: "Acesso a todos os recursos da plataforma",
  },
];

interface WelcomeModalProps {
  onProfileSelect: (profile: ProfileType) => void;
}

export function WelcomeModal({ onProfileSelect }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [logoAnimation, setLogoAnimation] = useState(true);

  useEffect(() => {
    // Verificar se é a primeira visita
    const isFirstVisit = localStorage.getItem("juris-study-first-visit") !== "false";
    
    if (isFirstVisit) {
      // Primeiro mostrar a animação do logo
      const logoTimer = setTimeout(() => {
        setLogoAnimation(false);
        
        // Depois mostrar o modal
        setTimeout(() => {
          setOpen(true);
          setShowAnimation(false);
        }, 500);
      }, 2000);
      
      return () => clearTimeout(logoTimer);
    } else {
      setShowAnimation(false);
      setLogoAnimation(false);
    }
  }, []);

  const handleConfirm = () => {
    if (selectedProfile) {
      localStorage.setItem("juris-study-first-visit", "false");
      localStorage.setItem("juris-study-profile", selectedProfile);
      onProfileSelect(selectedProfile);
      setOpen(false);
    }
  };

  if (showAnimation) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className={`text-center transition-opacity duration-500 ${logoAnimation ? 'opacity-100' : 'opacity-0'}`}>
          <Scale className="h-24 w-24 text-primary mx-auto mb-4 animate-pulse-subtle" />
          <h1 className="text-4xl font-bold">JurisStudy Pro</h1>
          <p className="text-xl text-muted-foreground mt-2">Sua plataforma completa de estudos jurídicos</p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Bem-vindo ao JurisStudy Pro!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Selecione seu perfil para personalizar sua experiência
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedProfile || ""}
            onValueChange={(value) => setSelectedProfile(value as ProfileType)}
            className="space-y-3"
          >
            {profileOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 rounded-lg border p-4 transition-all ${
                  selectedProfile === option.id 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex flex-col cursor-pointer">
                  <span className="font-medium">{option.title}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleConfirm} disabled={!selectedProfile}>
            Começar a usar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
