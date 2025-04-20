
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileNavigation from "@/components/MobileNavigation";
import RecentAccess from "@/components/RecentAccess";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  userProfile: ProfileType;
}

const Layout = ({ children, userProfile }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 p-3 md:p-6 overflow-auto pb-20 md:pb-6">
            {isHomePage && (
              <div className="md:max-w-4xl mx-auto">
                <RecentAccess />
              </div>
            )}
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
