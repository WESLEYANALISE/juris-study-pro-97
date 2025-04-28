import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileNavigation from "@/components/MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
interface LayoutProps {
  children: React.ReactNode;
  userProfile: ProfileType;
}
const Layout = ({
  children,
  userProfile
}: LayoutProps) => {
  const isMobile = useIsMobile();
  return <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 overflow-auto pb-20 md:pb-6 w-full">
            <div className="container mx-auto p-4 md:p-6 px-0">
              {children}
            </div>
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>;
};
export default Layout;