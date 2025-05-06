
import React, { useState, useEffect, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/sonner";
import OnboardingModal from "@/components/OnboardingModal";
import WelcomeCard from "@/components/WelcomeCard";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { motion } from "framer-motion";
import { type ProfileType } from "@/components/WelcomeModal";
import { useReducedMotion } from "@/utils/animation-utils";

interface LayoutProps {
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

// Memoized Main Content component
const MainContent = React.memo(({ 
  children, 
  backgroundVariant, 
  showWelcomeCard, 
  userData, 
  user,
  shouldReduceMotion
}: { 
  children: React.ReactNode;
  backgroundVariant: string;
  showWelcomeCard: boolean;
  userData: UserDataType;
  user: any;
  shouldReduceMotion: boolean;
}) => {
  // Simplified animation for better performance
  const contentAnimation = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0.1 : 0.3 }
  };

  return (
    <main className="flex-1 overflow-auto pb-20 md:pb-6 w-full">
      <JuridicalBackground variant={backgroundVariant} opacity={0.03}>
        <div className="container mx-auto p-4 md:p-6 py-[19px] px-px">
          {showWelcomeCard && (
            <WelcomeCard 
              userName={userData.displayName || user?.email?.split('@')[0] || 'Usuário'} 
              progress={userData.progress} 
              nextTaskTitle={userData.nextTask.title} 
              nextTaskTime={userData.nextTask.time} 
            />
          )}
          <motion.div
            initial={contentAnimation.initial}
            animate={contentAnimation.animate}
            transition={contentAnimation.transition}
          >
            {children}
          </motion.div>
        </div>
      </JuridicalBackground>
    </main>
  );
});
MainContent.displayName = 'MainContent';

const OptimizedLayout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  const { user, profile, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch user data - optimized to prevent unnecessary renders
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if onboarding is completed
        const onboardingCompleted = profile?.onboarding_completed || false;

        // Simplified data since we don't have the tables yet
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
      }
    };
    
    if (authLoading) {
      return; // Wait for auth check to complete
    }
    
    fetchUserData();
  }, [user, profile, authLoading]);

  // Function to handle onboarding completion - memoized
  const handleOnboardingComplete = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setShowOnboarding(false);
      setUserData(prev => ({
        ...prev,
        onboardingCompleted: true
      }));

      // Store in localStorage as a fallback
      localStorage.setItem('onboardingCompleted', 'true');
      console.log("Onboarding marcado como concluído com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar status do onboarding:", error);
    }
  }, [user?.id]);

  // Memoize the background variant calculation to prevent unnecessary recalculations
  const backgroundVariant = useMemo(() => {
    const path = location.pathname;
    
    if (path.includes('/vademecum')) return 'books';
    if (path.includes('/jogos')) return 'scales';
    if (path.includes('/jurisprudencia')) return 'gavel';
    if (path.includes('/constituicao')) return 'constitution';
    return 'default';
  }, [location.pathname]);

  // Show welcome card only on homepage and for logged in users
  const showWelcomeCard = useMemo(() => {
    return user && location.pathname === '/';
  }, [user, location.pathname]);

  // Show a loading screen while auth and user data are being fetched
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LoadingSpinner className="h-12 w-12 text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando aplicativo...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex flex-col w-full bg-gradient-dark">
        {/* Only render header once */}
        <Header userProfile={userProfile} />
        
        <div className="flex flex-1 w-full">
          {/* Only render sidebar once */}
          <AppSidebar userProfile={userProfile} />
          
          {/* Main content with optimized rendering */}
          <MainContent
            backgroundVariant={backgroundVariant}
            showWelcomeCard={showWelcomeCard}
            userData={userData}
            user={user}
            shouldReduceMotion={shouldReduceMotion}
          >
            {children}
          </MainContent>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        <Toaster />
        
        {/* Modal de onboarding para novos usuários */}
        <OnboardingModal 
          open={showOnboarding} 
          onOpenChange={setShowOnboarding} 
          onComplete={handleOnboardingComplete} 
        />
      </div>
    </SidebarProvider>
  );
};

export default OptimizedLayout;
