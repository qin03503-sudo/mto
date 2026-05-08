import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { calculateOfferAction } from "@/app/offers/[id]/calculation/actions";
import { AppShell } from "@/components/app-shell";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCalculationResults } from "@/lib/calculation";
import { getOfferById } from "@/lib/offers";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function CalculationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const currencyFormatter = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const numberFormatter = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits: 4,
  });
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const calculation = await getCalculationResults(id);
  const canCalculate = calculation.issues.length === 0;

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{offer.name} / {dictionary.calculation.title}</CardTitle>
              </div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </CardHeader>
            <CardContent className="space-y-4">
              {calculation.status === "outdated" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  {dictionary.calculation.staleWarning}
                </div>
              ) : null}
              {calculation.issues.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  <div className="font-medium">{dictionary.calculation.blocked}</div>
                  {calculation.issues.map((issue) => (
                    <div key={`${issue.code}-${issue.message}`}>{issue.message}</div>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <form action={calculateOfferAction.bind(null, id)}>
                  <Button disabled={!canCalculate}>{dictionary.common.calculate}</Button>
                </form>
                <Button nativeButton={false} variant="outline" render={<Link href={`/offers/${id}/scopes-lines`} />}>
                  {dictionary.calculation.editScopesAndLines}
                </Button>
                <Button nativeButton={false} variant="outline" render={<Link href={`/offers/${id}/material-prices`} />}>
                  {dictionary.calculation.editPrices}
                </Button>
              </div>
            </CardContent>
          </Card>

          {calculation.scopes.map((scope) => (
            <Card key={scope.scopeId}>
              <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{scope.scopeName}</CardTitle>
                  <CardDescription>
                    {scope.lines.length} {dictionary.calculation.linesConfigured}
                  </CardDescription>
                </div>
                <div className="text-xl font-semibold">
                  {currencyFormatter.format(scope.total)}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {scope.lines.map((line) => (
                  <div key={line.lineId} className="overflow-hidden rounded-xl border">
                    <div className="flex items-center justify-between border-b bg-muted/40 p-4">
                      <div>
                        <div className="font-medium">{line.lineName}</div>
                        <div className="text-xs text-muted-foreground">
                          {line.parts.length} {dictionary.calculation.partsCount}
                        </div>
                      </div>
                      <div className="font-medium">
                        {currencyFormatter.format(line.total)}
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{dictionary.common.part}</TableHead>
                          <TableHead className="text-right">{dictionary.calculation.qty}</TableHead>
                          <TableHead className="hidden md:table-cell text-right">
                            {dictionary.common.unitPrice}
                          </TableHead>
                          <TableHead className="text-right">{dictionary.common.total}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {line.parts.map((part) => (
                          <Fragment key={part.partId}>
                            <TableRow key={part.partId}>
                              <TableCell className="font-medium">
                                {part.partName}
                              </TableCell>
                              <TableCell className="text-right">{part.qty}</TableCell>
                              <TableCell className="hidden md:table-cell text-right">
                                {currencyFormatter.format(part.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {currencyFormatter.format(part.total)}
                              </TableCell>
                            </TableRow>
                            {part.details.length > 0 ? (
                              <TableRow key={`${part.partId}-details`}>
                                <TableCell colSpan={4} className="bg-muted/30 p-0">
                                  <div className="space-y-2 p-4">
                                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      {dictionary.calculation.mtoDrillDown}
                                    </div>
                                    <div className="grid gap-2">
                                      {part.details.map((detail) => (
                                        <div
                                          key={detail.mtoRowId}
                                          className="grid gap-2 rounded-lg border bg-background p-3 text-xs md:grid-cols-[1fr_90px_110px_110px] md:items-center"
                                        >
                                          <div>
                                            <div className="font-medium">
                                              {detail.materialName}
                                            </div>
                                            <div className="text-muted-foreground">
                                              {detail.dimension || dictionary.calculation.noDimension} / {detail.unit || dictionary.calculation.noUnit}
                                            </div>
                                          </div>
                                          <div className="md:text-right">
                                             {dictionary.common.value} {numberFormatter.format(detail.value)}
                                          </div>
                                          <div className="md:text-right">
                                            {currencyFormatter.format(detail.unitPrice)}
                                          </div>
                                          <div className="font-medium md:text-right">
                                            {currencyFormatter.format(detail.total)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{dictionary.calculation.run}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryRow label={dictionary.calculation.runId} value={calculation.id} />
            <SummaryRow label={dictionary.calculation.mtoVersion} value={calculation.mtoVersionId} />
            <SummaryRow label={dictionary.calculation.runTime} value={calculation.runAt} />
            <SummaryRow label={dictionary.calculation.offerTotal} value={currencyFormatter.format(calculation.total)} />
            <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
              <span className="text-sm text-muted-foreground">{dictionary.calculation.runStatus}</span>
              <Badge
                className={
                  calculation.status === "failed"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    : calculation.status === "outdated"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                }
              >
                {dictionary.statuses[calculation.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl border bg-muted/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="break-words font-medium">{value}</div>
    </div>
  );
}
