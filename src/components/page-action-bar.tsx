import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageAction = {
  key: string;
  label: string;
  ariaLabel: string;
  href: string;
};

type PageActionBarProps = {
  primary: PageAction;
  secondary?: PageAction[];
  tertiary?: PageAction[];
  className?: string;
};

export function PageActionBar({ primary, secondary = [], tertiary = [], className }: PageActionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button nativeButton={false} size="default" render={<Link href={primary.href} aria-label={primary.ariaLabel} />}>
        {primary.label}
      </Button>
      {secondary.map((action) => (
        <Button key={action.key} nativeButton={false} variant="outline" size="sm" render={<Link href={action.href} aria-label={action.ariaLabel} />}>
          {action.label}
        </Button>
      ))}
      {tertiary.map((action) => (
        <Button key={action.key} nativeButton={false} variant="ghost" size="sm" render={<Link href={action.href} aria-label={action.ariaLabel} />}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}
