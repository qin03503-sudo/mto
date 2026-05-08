import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageActionBarProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
  className?: string;
};

export function PageActionBar({
  primary,
  secondary,
  tertiary,
  className,
}: PageActionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="order-1">{primary}</div>
      {secondary ? <div className="order-2 flex flex-wrap items-center gap-2">{secondary}</div> : null}
      {tertiary ? <div className="order-3 ml-auto">{tertiary}</div> : null}
    </div>
  );
}
