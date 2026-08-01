import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
            <Icon className="size-5" strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
