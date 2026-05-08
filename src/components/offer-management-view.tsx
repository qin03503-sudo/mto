"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { OfferStatusBadge, CalculationStatusBadge } from "@/components/offer-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/lib/currency";
import type { Offer, OfferStatus } from "@/lib/offers";

type SortKey = "due" | "value" | "updated";

export function OfferManagementView({
  offers,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: {
  offers: Offer[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { dictionary, locale } = useI18n();
  const [statusFilter, setStatusFilter] = useState<"all" | OfferStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7" | "14">("all");
  const [sort, setSort] = useState<SortKey>("due");
  const [now] = useState(() => Date.now());

  const owners = Array.from(new Set(offers.map((offer) => offer.owner))).sort();

  const visibleOffers = useMemo(() => {
    return offers
      .filter((offer) => statusFilter === "all" || offer.status === statusFilter)
      .filter((offer) => ownerFilter === "all" || offer.owner === ownerFilter)
      .filter((offer) => {
        if (dateFilter === "all") {
          return true;
        }

        const dueAt = new Date(offer.closeDate).getTime();
        const threshold = now + Number(dateFilter) * 24 * 60 * 60 * 1000;

        return dueAt <= threshold;
      })
      .sort((left, right) => {
        if (sort === "value") {
          return right.total - left.total;
        }
        if (sort === "updated") {
          return new Date(right.inputDate).getTime() - new Date(left.inputDate).getTime();
        }

        return new Date(left.closeDate).getTime() - new Date(right.closeDate).getTime();
      });
  }, [dateFilter, offers, ownerFilter, sort, statusFilter]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{dictionary.management.savedFilterStatus}: {statusFilter}</Badge>
            <Badge variant="secondary">{dictionary.management.savedFilterOwner}: {ownerFilter}</Badge>
            <Badge variant="secondary">{dictionary.management.savedFilterDate}: {dateFilter === "all" ? dictionary.statuses.all : `${dateFilter}d`}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | OfferStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.statuses.all}</SelectItem>
              <SelectItem value="draft">{dictionary.statuses.draft}</SelectItem>
              <SelectItem value="pricing">{dictionary.statuses.pricing}</SelectItem>
              <SelectItem value="ready">{dictionary.statuses.ready}</SelectItem>
              <SelectItem value="sent">{dictionary.statuses.sent}</SelectItem>
              <SelectItem value="closed">{dictionary.statuses.closed}</SelectItem>
              <SelectItem value="cancelled">{dictionary.statuses.cancelled}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.statuses.all}</SelectItem>
              {owners.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as "all" | "7" | "14")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.management.anyDate}</SelectItem>
              <SelectItem value="7">{dictionary.management.next7Days}</SelectItem>
              <SelectItem value="14">{dictionary.management.next14Days}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="due">{dictionary.management.sortDueDate}</SelectItem>
              <SelectItem value="value">{dictionary.management.sortValue}</SelectItem>
              <SelectItem value="updated">{dictionary.management.sortUpdated}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline">{dictionary.management.bulkOpen}</Button>
          <Button type="button" size="sm" variant="outline">{dictionary.management.bulkCalculate}</Button>
          <Button type="button" size="sm">{dictionary.management.bulkMarkStatus}</Button>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dictionary.common.offer}</TableHead>
                <TableHead>{dictionary.common.status}</TableHead>
                <TableHead>{dictionary.offers.calculation}</TableHead>
                <TableHead>{dictionary.common.owner}</TableHead>
                <TableHead>{dictionary.common.closeDate}</TableHead>
                <TableHead className="text-right">{dictionary.common.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    <div className="space-y-1">
                      <p className="font-medium">{emptyTitle}</p>
                      <p>{emptyDescription}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibleOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <Link className="font-medium hover:underline" href={`/offers/${offer.id}/overview`}>
                        {offer.name}
                      </Link>
                    </TableCell>
                    <TableCell><OfferStatusBadge status={offer.status} /></TableCell>
                    <TableCell><CalculationStatusBadge status={offer.calculationStatus} /></TableCell>
                    <TableCell>{offer.owner}</TableCell>
                    <TableCell>{offer.closeDate}</TableCell>
                    <TableCell className="text-right">{formatMoney(offer.total, offer.currency, locale, 0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
