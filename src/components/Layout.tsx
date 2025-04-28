
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
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
  userProfile: ProfileType;
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
  children,
  userProfile
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

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user data for:", user.id);
        // Buscar perfil do usuário
        const {
          data: profileData,
          error: profileError
        } = await supabase.from('profiles').select('display_name, onboarding_completed').eq('id', user.id).maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsLoading(false);
          return;
        }

        console.log("Profile data fetched:", profileData);

        // Buscar próxima tarefa do cronograma
        let nextTaskData = null;
        try {
          const today = new Date();
          const { data: taskData, error: taskError } = await supabase
            .from('cronograma')
            .select('titulo, data_inicio')
            .eq('user_id', user.id)
            .eq('concluido', false)
            .gte('data_inicio', today.toISOString())
            .order('data_inicio', { ascending: true })
            .limit(1)
            .maybeSingle();
          
          if (taskError) {
            console.error("Error fetching next task:", taskError);
          } else {
            nextTaskData = taskData;
            console.log("Next task data:", nextTaskData);
          }
        } catch (err) {
          console.error("Exception when fetching next task:", err);
        }

        // Calcular progresso
        let progressData = 0;
        try {
          const { data: progress, error: progressError } = await supabase.rpc('calculate_user_progress', {
            user_uuid: user.id
          });
          
          if (progressError) {
            console.error("Error calculating progress:", progressError);
          } else {
            progressData = progress || 0;
            console.log("Progress data:", progressData);
          }
        } catch (err) {
          console.error("Exception when calculating progress:", err);
        }
        
        // Verificar se o onboarding já foi concluído
        const onboardingCompleted = profileData?.onboarding_completed || false;
        
        setUserData({
          displayName: profileData?.display_name || null,
          onboardingCompleted: onboardingCompleted,
          progress: progressData,
          nextTask: {
            title: nextTaskData?.titulo || null,
            time: nextTaskData?.data_inicio ? new Date(nextTaskData.data_inicio).toLocaleDateString() : null
          }
        });

        // Mostrar onboarding se não estiver completo e usuário estiver autenticado
        // Apenas uma vez quando os dados são carregados inicialmente
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
  }, [user, authLoading]);
  
  // Função para lidar com a conclusão do onboarding
  const handleOnboardingComplete = async () => {
    if (!user?.id) return;
    
    try {
      // Atualizar o perfil do usuário no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Atualizar o estado local
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
