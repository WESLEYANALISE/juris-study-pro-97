
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/sonner";
import OnboardingModal from "@/components/OnboardingModal";
import WelcomeCard from "@/components/WelcomeCard";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

const Layout = ({
  children
}: LayoutProps) => {
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    isLoading: authLoading
  } = useAuth();
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

  // Default profile for all users - fixed as "tudo" (complete access)
  const userProfile = "tudo";

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user data for:", user.id);
        
        // Check if onboarding is completed
        const onboardingCompleted = profile?.name === "completed" || false;
        
        // Simplified data since we don't have the tables yet
        let nextTaskData = null;
        let progressData = 0;
        
        setUserData({
          displayName: profile?.name || null,
          onboardingCompleted: onboardingCompleted,
          progress: progressData,
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
  
  // Function to handle onboarding completion
  const handleOnboardingComplete = async () => {
    if (!user?.id) return;
    
    try {
      // Update user profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ name: "completed" })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setShowOnboarding(false);
      setUserData(prev => ({...prev, onboardingCompleted: true}));
      
      console.log("Onboarding marcado como concluído com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar status do onboarding:", error);
    }
  };

  // Show a loading screen while auth and user data are being fetched
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 overflow-auto pb-20 md:pb-6 w-full">
            <div className="container mx-auto p-4 md:p-6 px-0">
              {/* Mostrar WelcomeCard apenas para usuários logados */}
              {user && location.pathname === '/' && <WelcomeCard 
                userName={userData.displayName || user.email?.split('@')[0]} 
                progress={userData.progress} 
                nextTaskTitle={userData.nextTask.title} 
                nextTaskTime={userData.nextTask.time} 
              />}
              {children}
            </div>
          </main>
        </div>
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

export default Layout;
