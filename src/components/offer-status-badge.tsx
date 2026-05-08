"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/client";
import type { CalculationStatus, OfferStatus } from "@/lib/offers";

const statusClasses: Record<OfferStatus | CalculationStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pricing: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ready: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  sent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  closed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  not_calculated: "bg-muted text-muted-foreground",
  current: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  outdated: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const { dictionary } = useI18n();

  return <Badge className={statusClasses[status]}>{dictionary.statuses[status]}</Badge>;
}

export function CalculationStatusBadge({
  status,
}: {
  status: CalculationStatus;
}) {
  const { dictionary } = useI18n();

  return (
    <Badge className={statusClasses[status]}>
      {dictionary.statuses[status]}
    </Badge>
  );
}
