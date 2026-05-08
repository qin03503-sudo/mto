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
type DateFilter = "all" | "7" | "14";

export function OfferManagementView({
  offers,
  title,
  description,
  emptyTitle,
  emptyDescription,
  savedFilters,
  showKpis = false,
}: {
  offers: Offer[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  savedFilters?: {
    status?: "all" | OfferStatus;
    owner?: "all" | string;
    date?: DateFilter;
  };
  showKpis?: boolean;
}) {
  const { dictionary, locale } = useI18n();
  const [statusFilter, setStatusFilter] = useState<"all" | OfferStatus>(savedFilters?.status ?? "all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>(savedFilters?.owner ?? "all");
  const [dateFilter, setDateFilter] = useState<DateFilter>(savedFilters?.date ?? "all");
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
  }, [dateFilter, now, offers, ownerFilter, sort, statusFilter]);

  const kpis = useMemo(() => {
    const openCount = visibleOffers.filter((offer) => offer.status !== "closed" && offer.status !== "cancelled").length;
    const totalValue = visibleOffers.reduce((sum, offer) => sum + offer.total, 0);
    const outdated = visibleOffers.filter((offer) => offer.calculationStatus === "outdated").length;

    return { openCount, totalValue, outdated };
  }, [visibleOffers]);

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
          <Select value={ownerFilter} onValueChange={(val) => setOwnerFilter(val ?? "all")}>
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

        {showKpis ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardDescription>{dictionary.offers.activeOffers}</CardDescription></CardHeader>
              <CardContent className="pt-0 text-2xl font-semibold">{kpis.openCount}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardDescription>{dictionary.offers.openValue}</CardDescription></CardHeader>
              <CardContent className="pt-0 text-2xl font-semibold">{formatMoney(kpis.totalValue, "USD", locale, 0)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardDescription>{dictionary.offers.outdatedCalculations}</CardDescription></CardHeader>
              <CardContent className="pt-0 text-2xl font-semibold">{kpis.outdated}</CardContent>
            </Card>
          </div>
        ) : null}

        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium">{dictionary.management.emptyStateGuidanceLabel} </span>
          {dictionary.management.emptyStateGuidance}
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
                <TableHead className="text-right">{dictionary.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/offers/${offer.id}/overview`} />}>
                          {dictionary.management.quickOpen}
                        </Button>
                        <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/offers/${offer.id}/calculation`} />}>
                          {dictionary.management.quickCalculate}
                        </Button>
                        <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/offers/${offer.id}/review`} />}>
                          {dictionary.management.quickMarkStatus}
                        </Button>
                      </div>
                    </TableCell>
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
