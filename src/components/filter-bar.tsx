import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function FilterBar({
  searchPlaceholder,
  searchName = "q",
  searchValue,
  chips,
  extra,
}: {
  searchPlaceholder: string;
  searchName?: string;
  searchValue?: string;
  chips?: Array<{ label: string; value: string }>;
  extra?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name={searchName} defaultValue={searchValue} placeholder={searchPlaceholder} className="pl-8" />
        </div>
        {extra}
      </div>
      {chips?.length ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip.label} variant="secondary">{chip.label}: {chip.value}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
