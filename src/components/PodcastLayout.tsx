
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PodcastHeader } from "@/components/podcast/PodcastHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/sonner";
import OnboardingModal from "@/components/OnboardingModal";
import WelcomeCard from "@/components/WelcomeCard";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "react-router-dom";
import PodcastNavigation from "@/components/podcast/PodcastNavigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { type ProfileType } from "@/components/WelcomeModal";
import { SoundscapeVisualization } from "@/components/ui/soundscape-theme";

interface PodcastLayoutProps {
  children: React.ReactNode;
}

interface UserDataType {
  displayName: string | null;
  onboardingCompleted: boolean;
  progress: number;
  nextTask: {
    title: string | null;
    time: string | null;
  };
}

const PodcastLayout = ({ children }: PodcastLayoutProps) => {
  const isMobile = useIsMobile();
  const { user, profile, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animateWave, setAnimateWave] = useState(false);
  const [userData, setUserData] = useState<UserDataType>({
    displayName: null,
    onboardingCompleted: true,
    progress: 0,
    nextTask: {
      title: null,
      time: null
    }
  });

  // Default profile for all users
  const userProfile: ProfileType = "tudo";

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        // Check if onboarding is completed
        const onboardingCompleted = profile?.onboarding_completed || false;

        setUserData({
          displayName: profile?.display_name || null,
          onboardingCompleted: onboardingCompleted,
          progress: 0,
          nextTask: {
            title: null,
            time: null
          }
        });

        // Show onboarding if not completed yet
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setIsLoading(false);
        
        // Start animating sound wave after loading
        setTimeout(() => setAnimateWave(true), 500);
      }
    };
    if (authLoading) {
      return; // Wait for auth check to complete
    }
    fetchUserData();
  }, [user, profile, authLoading]);

  // Function to handle onboarding completion
  const handleOnboardingComplete = async () => {
    if (!user?.id) return;
    try {
      setShowOnboarding(false);
      setUserData(prev => ({
        ...prev,
        onboardingCompleted: true
      }));

      localStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.error("Erro ao atualizar status do onboarding:", error);
    }
  };

  // Determine background variant based on current route
  const getBackgroundVariant = () => {
    const path = location.pathname;
    
    if (path.includes('/vademecum')) return 'books';
    if (path.includes('/jogos')) return 'scales';
    if (path.includes('/jurisprudencia')) return 'gavel';
    if (path.includes('/constituicao')) return 'constitution';
    return 'default';
  };

  // Show a loading screen while auth and user data are being fetched
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-950 to-purple-950/50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <LoadingSpinner className="h-12 w-12 text-primary" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <SoundscapeVisualization isPlaying={true} className="h-8" />
            </div>
          </div>
          <p className="mt-12 text-muted-foreground">Carregando aplicativo...</p>
        </motion.div>
      </div>
    );
  }

  const layoutVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.4
      }
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <motion.div 
        className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-purple-950/20"
        variants={layoutVariants}
        initial="hidden"
        animate="visible"
      >
        <PodcastHeader userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 overflow-auto pb-24 md:pb-6 w-full">
            <JuridicalBackground variant={getBackgroundVariant()}>
              <div className="container mx-auto p-4 md:p-6 py-[19px] px-px">
                {/* Show WelcomeCard only for logged in users on homepage */}
                {user && location.pathname === '/' && (
                  <WelcomeCard 
                    userName={userData.displayName || user.email?.split('@')[0] || 'Usuário'} 
                    progress={userData.progress} 
                    nextTaskTitle={userData.nextTask.title} 
                    nextTaskTime={userData.nextTask.time} 
                  />
                )}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {location.pathname !== '/' && (
                    <div className="h-1 w-full mb-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary/60"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }} 
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                  
                  {children}
                </motion.div>
              </div>
            </JuridicalBackground>
          </main>
        </div>
        <PodcastNavigation />
        <Toaster />
        
        {/* Onboarding modal for new users */}
        <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      </motion.div>
    </SidebarProvider>
  );
};

export default PodcastLayout;
