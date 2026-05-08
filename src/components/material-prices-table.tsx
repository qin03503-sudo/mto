"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, isPriceCurrency, priceCurrencies, type PriceCurrency } from "@/lib/currency";
import type { MaterialPrice } from "@/lib/material-prices";

export function MaterialPricesTable({
  offerId,
  prices,
}: {
  offerId: string;
  prices: MaterialPrice[];
}) {
  const { dictionary, locale } = useI18n();
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
  const [draftCurrencies, setDraftCurrencies] = useState<Record<string, PriceCurrency>>(() =>
    Object.fromEntries(
      prices.map((price) => [price.materialId, price.projectCurrency])
    ) as Record<string, PriceCurrency>
  );
  const [savingMaterialId, setSavingMaterialId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredPrices = rows.filter((price) => {
    const matchesChanged = !changedOnly || price.isOverridden;
    const matchesQuery =
      deferredQuery.length === 0 ||
      [price.material, price.dimension, price.unit, price.defaultCurrency, price.projectCurrency]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery);

    return matchesChanged && matchesQuery;
  });

  async function saveProjectPrice(materialId: string) {
    const unitPrice = Number(draftPrices[materialId]);
    const currency = draftCurrencies[materialId];

    setError(null);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setError(dictionary.materialPrices.projectPriceInvalid);
      return;
    }

    if (!isPriceCurrency(currency)) {
      setError(dictionary.materialPrices.projectCurrencyInvalid);
      return;
    }

    setSavingMaterialId(materialId);

    const response = await fetch(
      `/api/v1/offers/${encodeURIComponent(offerId)}/material-prices/${encodeURIComponent(materialId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit_price: unitPrice, currency }),
      }
    );

    const payload = (await response.json()) as {
      data?: MaterialPrice;
      error?: string;
    };
    const responseData = payload.data;

    if (!response.ok || !responseData) {
      setError(payload.error ?? dictionary.materialPrices.couldNotSave);
      setSavingMaterialId(null);
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.materialId === materialId ? responseData as MaterialPrice : row
      )
    );
    setDraftCurrencies((current) => Object.assign({}, current, {
      [materialId]: responseData.projectCurrency,
    }) as Record<string, PriceCurrency>);
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
          placeholder={dictionary.materialPrices.searchPlaceholder}
        />
        <Button
          type="button"
          variant={changedOnly ? "default" : "outline"}
          onClick={() => setChangedOnly((current) => !current)}
        >
          {dictionary.materialPrices.showChangedOnly}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary.common.material}</TableHead>
              <TableHead className="hidden md:table-cell">{dictionary.common.dimension}</TableHead>
              <TableHead>{dictionary.common.unit}</TableHead>
              <TableHead className="text-right">{dictionary.common.defaultPrice}</TableHead>
              <TableHead className="text-right">{dictionary.common.projectPrice}</TableHead>
              <TableHead>{dictionary.common.changed}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {dictionary.materialPrices.noMatches}
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
                    {formatMoney(price.defaultPrice, price.defaultCurrency, locale)}
                  </TableCell>
                  <TableCell className="min-w-[250px] text-right">
                    <div className="flex items-center justify-end gap-2">
                      {price.projectPrice === null ? (
                        <Badge variant="destructive">{dictionary.common.unresolved}</Badge>
                      ) : null}
                      <Input
                        aria-label={dictionary.materialPrices.ariaProjectPrice.replace("{material}", price.material)}
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
                      <select
                        aria-label={dictionary.common.currency}
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                        value={draftCurrencies[price.materialId] ?? price.projectCurrency}
                        onChange={(event) => {
                          const currency = event.target.value as PriceCurrency;
                          setDraftCurrencies((current) => ({...current, [price.materialId]: currency}) as Record<string, PriceCurrency>);
                        }}
                      >
                        {priceCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingMaterialId === price.materialId}
                        onClick={() => saveProjectPrice(price.materialId)}
                      >
                        {savingMaterialId === price.materialId ? dictionary.common.saving : dictionary.common.save}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {price.isOverridden ? (
                      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        {dictionary.common.yes}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{dictionary.common.no}</Badge>
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
