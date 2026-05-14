import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="pt-4 md:pt-2">
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  caption?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'info';
}

export function StatTile({ label, value, caption, icon: Icon, tone = 'primary' }: StatTileProps) {
  const toneClass = {
    primary: 'text-primary',
    success: 'text-[hsl(var(--success))]',
    warning: 'text-[hsl(var(--warning))]',
    info: 'text-[hsl(var(--info))]',
  }[tone];

  return (
    <div className="rounded-2xl bg-background p-5 shadow-extruded transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-inset-sm', toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight">{value}</div>
      {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

interface PanelProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, description, action, children, className }: PanelProps) {
  return (
    <section className={cn('rounded-2xl bg-background p-6 shadow-extruded', className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface ViewAllLinkProps {
  to: string;
  label?: string;
}

export function ViewAllLink({ to, label = 'View all' }: ViewAllLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-extruded-xs transition-all hover:shadow-inset-sm"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  tone?: 'primary' | 'success' | 'warning' | 'info';
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const toneDot = {
    primary: 'bg-primary',
    success: 'bg-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning))]',
    info: 'bg-[hsl(var(--info))]',
  };
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <div className="relative flex flex-col items-center pt-1.5">
            <div className={cn('h-2.5 w-2.5 rounded-full shadow-extruded-xs', toneDot[item.tone || 'primary'])} />
            {i < items.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
          </div>
          <div className="flex-1 pb-1">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface QuickToolItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

export function QuickToolsGrid({ items }: { items: QuickToolItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, icon: Icon, to }) => (
        <Link
          key={label}
          to={to}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-background p-4 text-center shadow-extruded-sm transition-all hover:shadow-inset-sm active:shadow-inset"
        >
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function StatusPill({ status, label }: { status: 'operational' | 'degraded' | 'down'; label: string }) {
  const dot = {
    operational: 'bg-[hsl(var(--success))]',
    degraded: 'bg-[hsl(var(--warning))]',
    down: 'bg-destructive',
  }[status];
  return (
    <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 shadow-inset-sm">
      <span className="text-sm font-semibold">System Status</span>
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={cn('h-2 w-2 rounded-full animate-pulse', dot)} />
        {label}
      </span>
    </div>
  );
}
