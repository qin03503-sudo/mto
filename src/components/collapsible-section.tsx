import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CollapsibleSection({
  id,
  title,
  description,
  collapsed,
  toggleHref,
  actions,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  collapsed: boolean;
  toggleHref: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div>
          <div className="font-medium">{title}</div>
          {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Button nativeButton={false} size="sm" variant="ghost" render={<a href={toggleHref} />}>
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>
      {!collapsed ? children : null}
    </section>
  );
}
