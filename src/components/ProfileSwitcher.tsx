
import { Check, ChevronsUpDown, GraduationCap, Scale, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type ProfileType } from "@/components/WelcomeModal";

const profiles = [
  {
    value: "concurseiro",
    label: "Concurseiro",
    icon: GraduationCap,
    description: "Foco em concursos públicos jurídicos",
  },
  {
    value: "universitario",
    label: "Universitário",
    icon: User,
    description: "Estudante de Direito em graduação",
  },
  {
    value: "advogado",
    label: "Advogado",
    icon: Scale,
    description: "Profissional em exercício",
  },
  {
    value: "oab",
    label: "Candidato OAB",
    icon: BookOpen,
    description: "Preparação específica para Exame da Ordem",
  },
  {
    value: "tudo",
    label: "Tudo",
    icon: User,
    description: "Acesso completo à plataforma",
  },
];

interface ProfileSwitcherProps {
  currentProfile?: ProfileType;
  onProfileChange?: (profile: ProfileType) => void;
}

export function ProfileSwitcher({ 
  currentProfile = "tudo", 
  onProfileChange 
}: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  
  // Make sure we have a valid profile even if the passed currentProfile is invalid
  const [selectedProfile, setSelectedProfile] = useState(() => {
    const foundProfile = profiles.find(p => p.value === currentProfile);
    return foundProfile || profiles[4]; // Use the "tudo" profile as fallback
  });

  const handleProfileSelect = (profile: typeof profiles[0]) => {
    try {
      setSelectedProfile(profile);
      setOpen(false);
      if (onProfileChange) {
        onProfileChange(profile.value as ProfileType);
      }
    } catch (error) {
      console.error("Erro ao selecionar perfil:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedProfile && (
              <>
                <selectedProfile.icon className="h-5 w-5 text-primary" />
                <span className="truncate">{selectedProfile.label}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-popover">
        <Command>
          <CommandInput placeholder="Buscar perfil..." />
          <CommandEmpty>Nenhum perfil encontrado.</CommandEmpty>
          <CommandGroup>
            {profiles.map((profile) => (
              <CommandItem
                key={profile.value}
                value={profile.value}
                onSelect={() => handleProfileSelect(profile)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <profile.icon className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span>{profile.label}</span>
                    <span className="text-xs text-muted-foreground">{profile.description}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedProfile.value === profile.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
