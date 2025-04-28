
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
import { useNavigate, useLocation } from "react-router-dom";

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
    profile
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserDataType>({
    displayName: null,
    onboardingCompleted: true,
    progress: 0,
    nextTask: {
      title: null,
      time: null
    }
  });

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!user && location.pathname !== "/auth") {
      navigate("/auth");
    }
  }, [user, navigate, location.pathname]);

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        // Buscar perfil do usuário
        const {
          data: profileData,
          error: profileError
        } = await supabase.from('profiles').select('display_name, onboarding_completed').eq('id', user.id).maybeSingle();
        
        if (profileError) throw profileError;

        // Buscar próxima tarefa do cronograma
        const today = new Date();
        const {
          data: nextTaskData
        } = await supabase.from('cronograma').select('titulo, data_inicio').eq('user_id', user.id).eq('concluido', false).gte('data_inicio', today.toISOString()).order('data_inicio', {
          ascending: true
        }).limit(1).maybeSingle();

        // Calcular progresso
        const {
          data: progressData
        } = await supabase.rpc('calculate_user_progress', {
          user_uuid: user.id
        });
        
        // Verificar se o onboarding já foi concluído
        const onboardingCompleted = profileData?.onboarding_completed || false;
        
        setUserData({
          displayName: profileData?.display_name || null,
          onboardingCompleted: onboardingCompleted,
          progress: progressData || 0,
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
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Função para lidar com a conclusão do onboarding
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setUserData(prev => ({...prev, onboardingCompleted: true}));
  };
  
  return <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 overflow-auto pb-20 md:pb-6 w-full">
            <div className="container mx-auto p-4 md:p-6 px-0">
              {/* Mostrar WelcomeCard apenas para usuários logados */}
              {user && location.pathname === '/' && <WelcomeCard userName={userData.displayName || user.email?.split('@')[0]} progress={userData.progress} nextTaskTitle={userData.nextTask.title} nextTaskTime={userData.nextTask.time} />}
              {children}
            </div>
          </main>
        </div>
        <Toaster />
        
        {/* Modal de onboarding para novos usuários */}
        <OnboardingModal 
          open={showOnboarding} 
          onOpenChange={setShowOnboarding}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </SidebarProvider>;
};

export default Layout;
