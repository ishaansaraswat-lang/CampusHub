import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  UserCircle,
  ChevronUp,
  CalendarCheck,
  Trophy,
  FileText,
  Image,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { isStudent, isEventAdmin, isPlacementCell, isSuperAdmin } = useRole();

  const studentNav: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Events', url: '/events', icon: Calendar },
    { title: 'Placements', url: '/placements', icon: Briefcase },
    { title: 'Profile', url: '/profile', icon: UserCircle },
  ];

  const eventAdminNav: NavItem[] = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'My Events', url: '/admin/events', icon: Calendar },
    { title: 'Registrations', url: '/admin/registrations', icon: Users },
    { title: 'Results', url: '/admin/results', icon: Trophy },
    { title: 'Gallery', url: '/admin/gallery', icon: Image },
  ];

  const placementNav: NavItem[] = [
    { title: 'Dashboard', url: '/placement-admin/dashboard', icon: LayoutDashboard },
    { title: 'Companies', url: '/placement-admin/companies', icon: Building2 },
    { title: 'Job Postings', url: '/placement-admin/jobs', icon: FileText },
    { title: 'Applications', url: '/placement-admin/applications', icon: ClipboardList },
    { title: 'Results', url: '/placement-admin/results', icon: Trophy },
    { title: 'Statistics', url: '/placement-admin/statistics', icon: BarChart3 },
  ];

  const superAdminNav: NavItem[] = [
    { title: 'Dashboard', url: '/super-admin/dashboard', icon: LayoutDashboard },
    { title: 'Events', url: '/super-admin/events', icon: Calendar },
    { title: 'Users', url: '/super-admin/users', icon: Users },
    { title: 'Settings', url: '/super-admin/settings', icon: Settings },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {items.map((item) => {
            const active = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'h-12 rounded-2xl px-4 font-medium transition-all duration-300',
                    active
                      ? 'shadow-inset text-primary hover:text-primary'
                      : 'text-muted-foreground hover:text-primary hover:shadow-inset-sm hover:bg-transparent',
                  )}
                >
                  <Link to={item.url}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-none bg-background">
      <SidebarHeader className="bg-background">
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-extruded-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight">CampusFlow</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-background px-3">
        {isStudent && renderNavGroup('Student', studentNav)}
        {isEventAdmin && renderNavGroup('Event Admin', eventAdminNav)}
        {isPlacementCell && renderNavGroup('Placement Cell', placementNav)}
        {isSuperAdmin && renderNavGroup('Super Admin', superAdminNav)}
      </SidebarContent>

      <SidebarFooter className="bg-background p-3">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-auto rounded-2xl bg-background p-3 shadow-extruded-sm transition-all hover:bg-background hover:shadow-inset-sm data-[state=open]:shadow-inset-sm"
                >
                  <Avatar className="h-9 w-9 shadow-extruded-sm">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-background text-primary">
                      {profile?.name ? getInitials(profile.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.name || 'User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              >
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="h-12 rounded-2xl bg-background px-4 font-medium text-muted-foreground shadow-extruded-sm transition-all hover:bg-background hover:text-destructive hover:shadow-inset-sm active:shadow-inset"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
