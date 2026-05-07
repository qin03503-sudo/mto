"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MaterialPrice } from "@/lib/material-prices";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function MaterialPricesTable({
  offerId,
  prices,
}: {
  offerId: string;
  prices: MaterialPrice[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [rows, setRows] = useState(prices);
  const [draftPrices, setDraftPrices] = useState(() =>
    Object.fromEntries(
      prices.map((price) => [
        price.materialId,
        price.projectPrice === null ? "" : String(price.projectPrice),
      ])
    )
  );
  const [savingMaterialId, setSavingMaterialId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredPrices = rows.filter((price) => {
    const matchesChanged = !changedOnly || price.isOverridden;
    const matchesQuery =
      deferredQuery.length === 0 ||
      [price.material, price.dimension, price.unit]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery);

    return matchesChanged && matchesQuery;
  });

  async function saveProjectPrice(materialId: string) {
    const unitPrice = Number(draftPrices[materialId]);

    setError(null);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setError("Project price must be a non-negative number.");
      return;
    }

    setSavingMaterialId(materialId);

    const response = await fetch(
      `/api/v1/offers/${encodeURIComponent(offerId)}/material-prices/${encodeURIComponent(materialId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit_price: unitPrice }),
      }
    );

    const payload = (await response.json()) as {
      data?: MaterialPrice;
      error?: string;
    };

    if (!response.ok || !payload.data) {
      setError(payload.error ?? "Could not save material price.");
      setSavingMaterialId(null);
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.materialId === materialId ? payload.data as MaterialPrice : row
      )
    );
    setSavingMaterialId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search material, dimension, or unit..."
        />
        <Button
          type="button"
          variant={changedOnly ? "default" : "outline"}
          onClick={() => setChangedOnly((current) => !current)}
        >
          Show changed only
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead className="hidden md:table-cell">Dimension</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Default Price</TableHead>
              <TableHead className="text-right">Project Price</TableHead>
              <TableHead>Changed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No material prices match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredPrices.map((price) => (
                <TableRow key={price.materialId}>
                  <TableCell>
                    <div className="font-medium">{price.material}</div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      {price.dimension}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {price.dimension}
                  </TableCell>
                  <TableCell>{price.unit}</TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(price.defaultPrice)}
                  </TableCell>
                  <TableCell className="min-w-[180px] text-right">
                    <div className="flex items-center justify-end gap-2">
                      {price.projectPrice === null ? (
                        <Badge variant="destructive">Unresolved</Badge>
                      ) : null}
                      <Input
                        aria-label={`${price.material} project price`}
                        className="h-8 w-28 text-right"
                        min="0"
                        step="0.01"
                        type="number"
                        value={draftPrices[price.materialId] ?? ""}
                        onChange={(event) =>
                          setDraftPrices((current) => ({
                            ...current,
                            [price.materialId]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingMaterialId === price.materialId}
                        onClick={() => saveProjectPrice(price.materialId)}
                      >
                        {savingMaterialId === price.materialId ? "Saving" : "Save"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {price.isOverridden ? (
                      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
