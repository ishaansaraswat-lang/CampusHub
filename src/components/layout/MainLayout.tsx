import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background border-l border-border shadow-[inset_6px_0_12px_-6px_hsl(var(--neu-dark)/0.4)]">
        <div className="sticky top-0 z-30 flex h-12 items-center px-4 md:px-6 bg-background/80 backdrop-blur">
          <SidebarTrigger className="h-10 w-10 rounded-xl bg-background shadow-extruded-sm hover:shadow-inset-sm transition-all" />
        </div>
        <main className="flex-1 overflow-auto px-4 pb-8 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
