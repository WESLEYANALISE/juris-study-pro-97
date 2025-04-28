
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Star, BookOpen, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

export type BadgeType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  achieved_at?: string;
  progress?: number;
  max_progress?: number;
};

export interface CursoBadgesProps {
  userId?: string;
}

export function CursoBadges({ userId }: CursoBadgesProps) {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [newBadge, setNewBadge] = useState<BadgeType | null>(null);

  // Default badges for all users
  const defaultBadges: Omit<BadgeType, 'id' | 'achieved' | 'achieved_at'>[] = [
    {
      name: "Primeiro Curso",
      description: "Completou seu primeiro curso",
      icon: "trophy",
      progress: 0,
      max_progress: 1
    },
    {
      name: "Estudante Dedicado",
      description: "Completou 5 cursos",
      icon: "book",
      progress: 0,
      max_progress: 5
    },
    {
      name: "Especialista",
      description: "Completou todos os cursos de uma área",
      icon: "award",
      progress: 0,
      max_progress: 1
    },
    {
      name: "Avaliador",
      description: "Avaliou 3 cursos diferentes",
      icon: "star",
      progress: 0,
      max_progress: 3
    },
    {
      name: "Maratonista",
      description: "Assistiu 10 horas de conteúdo",
      icon: "clock",
      progress: 0,
      max_progress: 10
    }
  ];

  // Load user badges
  useEffect(() => {
    const fetchBadges = async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      try {
        // Get user's badges from database
        const { data, error } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", targetUserId);

        if (error) throw error;

        // Map database badges to our format and fill in defaults
        const userBadges = defaultBadges.map(defaultBadge => {
          const dbBadge = data?.find(b => b.badge_name === defaultBadge.name);
          
          return {
            id: dbBadge?.id || `default-${defaultBadge.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: defaultBadge.name,
            description: defaultBadge.description,
            icon: defaultBadge.icon,
            achieved: !!dbBadge?.achieved,
            achieved_at: dbBadge?.achieved_at,
            progress: dbBadge?.progress || 0,
            max_progress: defaultBadge.max_progress
          };
        });

        setBadges(userBadges);
      } catch (error) {
        console.error("Error loading badges:", error);
      }
    };

    fetchBadges();
  }, [userId, user]);

  // Show badge achievement dialog
  useEffect(() => {
    if (newBadge) {
      setSelectedBadge(newBadge);
      setShowBadgeDialog(true);
    }
  }, [newBadge]);

  // Render the icon for the badge
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-6 w-6" />;
      case "award":
        return <Award className="h-6 w-6" />;
      case "star":
        return <Star className="h-6 w-6" />;
      case "book":
        return <BookOpen className="h-6 w-6" />;
      case "clock":
        return <Clock className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Conquistas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center justify-center p-4 rounded-md border cursor-pointer ${
              badge.achieved 
                ? "bg-primary/10 border-primary" 
                : "bg-muted/30 border-muted text-muted-foreground"
            }`}
            onClick={() => {
              setSelectedBadge(badge);
              setShowBadgeDialog(true);
            }}
          >
            <div className={`p-3 rounded-full ${
              badge.achieved ? "bg-primary/20" : "bg-muted"
            } mb-2`}>
              {renderBadgeIcon(badge.icon)}
            </div>
            <p className="text-xs font-medium text-center">{badge.name}</p>
            {!badge.achieved && badge.progress !== undefined && badge.max_progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${(badge.progress / badge.max_progress) * 100}%` }}
                ></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Badge Detail Dialog */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBadge?.achieved ? "Conquista Desbloqueada!" : "Conquista Bloqueada"}
            </DialogTitle>
            <DialogDescription>
              {selectedBadge?.achieved 
                ? `Parabéns! Você conquistou esta badge em ${
                    selectedBadge.achieved_at 
                      ? new Date(selectedBadge.achieved_at).toLocaleDateString() 
                      : "uma data não registrada"
                  }.` 
                : "Continue estudando para desbloquear esta conquista."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            <div className={`p-6 rounded-full ${
              selectedBadge?.achieved ? "bg-primary/20" : "bg-muted"
            } mb-4`}>
              {selectedBadge && renderBadgeIcon(selectedBadge.icon)}
            </div>
            <h3 className="text-xl font-bold mb-1">{selectedBadge?.name}</h3>
            <p className="text-center text-muted-foreground">
              {selectedBadge?.description}
            </p>

            {!selectedBadge?.achieved && selectedBadge?.progress !== undefined && selectedBadge?.max_progress !== undefined && (
              <div className="w-full max-w-xs mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{selectedBadge.progress} / {selectedBadge.max_progress}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${(selectedBadge.progress / selectedBadge.max_progress) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CursoBadges;
