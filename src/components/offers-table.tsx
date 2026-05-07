"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import {
  CalculationStatusBadge,
  OfferStatusBadge,
} from "@/components/offer-status-badge";
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
import type { Offer, OfferStatus } from "@/lib/offers";

const statusFilters: Array<{ label: string; value: "all" | OfferStatus }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pricing", value: "pricing" },
  { label: "Ready", value: "ready" },
  { label: "Sent", value: "sent" },
  { label: "Closed", value: "closed" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function OffersTable({ offers }: { offers: Offer[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OfferStatus>("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredOffers = offers.filter((offer) => {
    const matchesStatus = status === "all" || offer.status === status;
    const matchesQuery =
      deferredQuery.length === 0 ||
      [offer.name, offer.offerNumber, offer.owner]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by offer, number, or owner..."
        />
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Calculation</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="hidden lg:table-cell">Close date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No offers match the current search and status filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <Link
                      href={`/offers/${offer.id}/overview`}
                      className="font-medium hover:underline"
                    >
                      {offer.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {offer.offerNumber} · {offer.scopes} scopes · {offer.lines} lines
                    </div>
                  </TableCell>
                  <TableCell>
                    <OfferStatusBadge status={offer.status} />
                  </TableCell>
                  <TableCell>
                    <CalculationStatusBadge status={offer.calculationStatus} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{offer.owner}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {offer.closeDate}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencyFormatter.format(offer.total)}
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
