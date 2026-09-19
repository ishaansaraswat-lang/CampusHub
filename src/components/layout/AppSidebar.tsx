import { Link, NavLink, useLocation } from 'react-router-dom';
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
  Trophy,
  FileText,
  Image,
  ClipboardList,
  BarChart3,
  UserRound,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const {
    isStudent,
    isEventAdmin,
    isPlacementCell,
    isAdmissionsCell,
    isSuperAdmin,
  } = useRole();

  const studentNav: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Events',
      url: '/events',
      icon: Calendar,
    },
    {
      title: 'Placements',
      url: '/placements',
      icon: Briefcase,
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: UserCircle,
    },
  ];

  const eventAdminNav: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'My Events',
      url: '/admin/events',
      icon: Calendar,
    },
    {
      title: 'Registrations',
      url: '/admin/registrations',
      icon: Users,
    },
    {
      title: 'Results',
      url: '/admin/results',
      icon: Trophy,
    },
    {
      title: 'Gallery',
      url: '/admin/gallery',
      icon: Image,
    },
  ];

  const placementNav: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/placement-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Companies',
      url: '/placement-admin/companies',
      icon: Building2,
    },
    {
      title: 'Job Postings',
      url: '/placement-admin/jobs',
      icon: FileText,
    },
    {
      title: 'Applications',
      url: '/placement-admin/applications',
      icon: ClipboardList,
    },
    {
      title: 'Results',
      url: '/placement-admin/results',
      icon: Trophy,
    },
    {
      title: 'Statistics',
      url: '/placement-admin/statistics',
      icon: BarChart3,
    },
  ];

  const admissionsNav: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Manage Admissions',
      url: '/admissions/manage',
      icon: ClipboardList,
    },
    {
      title: 'Admissions Analytics',
      url: '/admissions/analytics',
      icon: BarChart3,
    },
  ];  const superAdminNav: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/super-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Events',
      url: '/super-admin/events',
      icon: Calendar,
    },
    {
      title: 'Placement Overview',
      url: '/super-admin/placement',
      icon: Briefcase,
    },
    {
      title: 'Admissions Overview',
      url: '/super-admin/admissions',
      icon: GraduationCap,
    },
    {
      title: 'Users',
      url: '/super-admin/users',
      icon: Users,
    },
    {
      title: 'Student 360',
      url: '/super-admin/students',
      icon: Users,
    },
    {
      title: 'Settings',
      url: '/super-admin/settings',
      icon: Settings,
    },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <SidebarGroup key={title}>
      <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            const active = location.pathname === item.url;

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'h-11 rounded-xl px-4 font-medium transition-all duration-200',
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 hover:text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
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
    <Sidebar className="border-none bg-[#0B1220] text-white">
      <SidebarHeader className="bg-[#0B1220] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <GraduationCap className="h-5 w-5" />
          </div>

          <h1 className="font-display text-xl font-bold tracking-tight text-white">
            CampusHub
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0B1220] px-3 py-4">
        {isStudent && renderNavGroup('Student', studentNav)}

        {isEventAdmin && renderNavGroup('Event Admin', eventAdminNav)}

        {isPlacementCell && renderNavGroup('Placement Cell', placementNav)}

        {isAdmissionsCell && renderNavGroup('Admissions Cell', admissionsNav)}

        {isAdmissionsCell && !isPlacementCell && (
          <div className="mx-2 mt-3 border-t border-white/10 pt-3">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <UserRound className="h-4 w-4" />
              Profile
            </NavLink>
          </div>
        )}
        {isPlacementCell && (
          <div className="mx-2 mt-3 border-t border-white/10 pt-3">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <UserRound className="h-4 w-4" />
              Profile
            </NavLink>
          </div>
        )}
        {isSuperAdmin && renderNavGroup('Super Admin', superAdminNav)}
      </SidebarContent>

      <SidebarFooter className="bg-[#0B1220] border-t border-white/10 p-3">
        <SidebarMenu className="gap-1.5">
                    <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto cursor-default rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/5"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-600 text-white">
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
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="h-11 rounded-xl px-4 font-medium text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-400"
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





























