import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const isUUID = (s: string) => /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(s);

  const dashboardRoutes: Record<string, string> = {
    'super-admin': '/super-admin/dashboard',
    'placement-admin': '/placement-admin/dashboard',
    'event-admin': '/event-admin/dashboard',
  };
  
  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.filter((s) => !isUUID(s)).map((segment, index, filtered) => {
                const isLast = index === filtered.length - 1;
                const href = dashboardRoutes[segment] || '/' + pathSegments.slice(0, pathSegments.indexOf(segment) + 1).join('/');

                return (
                  <span key={segment} className="flex items-center gap-2">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href}>
                          {formatSegment(segment)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
