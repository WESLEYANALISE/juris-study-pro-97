import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { type ProfileType } from "@/components/WelcomeModal";
import MobileNavigation from "@/components/MobileNavigation";
interface LayoutProps {
  children: React.ReactNode;
  userProfile: ProfileType;
}
const Layout = ({
  children,
  userProfile
}: LayoutProps) => {
  return <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header userProfile={userProfile} />
        <div className="flex flex-1 w-full">
          <AppSidebar userProfile={userProfile} />
          <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6 py-[15px] my-0 mx-0 px-0">
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>;
};
export default Layout;