import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        secondary: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/15 text-destructive",
        outline: "bg-background text-foreground shadow-extruded-xs",
        success: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
        warning: "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]",
        info: "bg-[hsl(var(--info)/0.15)] text-[hsl(var(--info))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
