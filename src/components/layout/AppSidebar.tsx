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
  ];

  const superAdminNav: NavItem[] = [
    { title: 'Dashboard', url: '/super-admin/dashboard', icon: LayoutDashboard },
    { title: 'Events', url: '/super-admin/events', icon: Calendar },
    { title: 'Users', url: '/super-admin/users', icon: Users },
    { title: 'Settings', url: '/super-admin/settings', icon: Settings },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
              >
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">College Hub</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isStudent && renderNavGroup('Student', studentNav)}
        {isEventAdmin && renderNavGroup('Event Admin', eventAdminNav)}
        {isPlacementCell && renderNavGroup('Placement Cell', placementNav)}
        {isSuperAdmin && renderNavGroup('Super Admin', superAdminNav)}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
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
                  <ChevronUp className="ml-auto h-4 w-4" />
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
