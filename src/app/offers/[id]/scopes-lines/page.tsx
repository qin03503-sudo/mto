import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addLineAction,
  addPartAction,
  addScopeAction,
} from "@/app/offers/[id]/scopes-lines/actions";
import { AppShell } from "@/components/app-shell";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/currency";
import { getOfferById } from "@/lib/offers";
import {
  getOfferScopes,
  getPartUnitPrice,
  getPartsForScope,
  getScopeLineSummary,
  getScopes,
} from "@/lib/scopes-lines";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function ScopesLinesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const offerScopes = await getOfferScopes(id);
  const summary = await getScopeLineSummary(id);
  const allScopes = await getScopes();
  const scopeById = new Map(allScopes.map((scope) => [scope.id, scope]));
  const partsByScopeEntries = await Promise.all(
    offerScopes.map(async (offerScope) => [
      offerScope.scopeId,
      await getPartsForScope(offerScope.scopeId),
    ] as const)
  );
  const partsByScope = new Map(partsByScopeEntries);
  const partById = new Map(
    partsByScopeEntries.flatMap(([, parts]) => parts.map((part) => [part.id, part] as const))
  );
  const selectedScopeIds = new Set(offerScopes.map((scope) => scope.scopeId));
  const availableScopes = allScopes.filter((scope) => !selectedScopeIds.has(scope.id));
  const unitPriceEntries = await Promise.all(
    offerScopes.flatMap((offerScope) => {
      const validParts = partsByScope.get(offerScope.scopeId) ?? [];
      const partIds = new Set([
        ...validParts.map((part) => part.id),
        ...offerScope.lines.flatMap((line) => line.parts.map((part) => part.partId)),
      ]);

      return Array.from(partIds).map(async (partId) => [
        `${offerScope.scopeId}:${partId}`,
        await getPartUnitPrice(id, offerScope.scopeId, partId),
      ] as const);
    })
  );
  const unitPrices = new Map(unitPriceEntries);
  const flow = await getOfferFlowState(id);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{offer.name} / {dictionary.scopesLines.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {allScopes.map((scope) => (
                  <Badge
                    key={scope.id}
                    variant={selectedScopeIds.has(scope.id) ? "default" : "outline"}
                    className="h-7 px-3"
                  >
                    {scope.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <form
                  action={addScopeAction.bind(null, id)}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="scope_id">{dictionary.scopesLines.addScope}</Label>
                    <Select name="scope_id" disabled={availableScopes.length === 0}>
                      <SelectTrigger id="scope_id" className="w-full sm:w-[220px]">
                        <SelectValue placeholder={dictionary.scopesLines.selectScope} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableScopes.map((scope) => (
                          <SelectItem key={scope.id} value={scope.id}>
                            {scope.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" disabled={availableScopes.length === 0}>
                    {dictionary.scopesLines.addScopeButton}
                  </Button>
                </form>
                <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/offers/${id}/overview`} />}>
                  {dictionary.common.backToOverview}
                </Button>
              </div>
            </CardContent>
          </Card>

          {offerScopes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.scopesLines.noScopesSelected}</CardTitle>
                <CardDescription>
                  {dictionary.scopesLines.calculationBlockedNoScopes}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            offerScopes.map((offerScope) => {
              const scope = scopeById.get(offerScope.scopeId);
              const validParts = partsByScope.get(offerScope.scopeId) ?? [];

              return (
                <Card key={offerScope.id}>
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{scope?.name ?? dictionary.scopesLines.unknownScope}</CardTitle>
                      <CardDescription>
                        {scope?.description ?? dictionary.scopesLines.missingScopeData}
                      </CardDescription>
                    </div>
                    <form
                      action={addLineAction.bind(null, id)}
                      className="flex flex-col gap-2 sm:flex-row sm:items-end"
                    >
                      <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                      <div className="grid gap-2">
                        <Label htmlFor={`line_name_${offerScope.id}`}>{dictionary.scopesLines.lineName}</Label>
                        <Input
                          id={`line_name_${offerScope.id}`}
                          name="line_name"
                          placeholder={dictionary.scopesLines.linePlaceholder}
                          required
                        />
                      </div>
                      <Button size="sm" variant="outline">
                        {dictionary.scopesLines.addLine}
                      </Button>
                    </form>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {offerScope.lines.length === 0 ? (
                      <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                        {dictionary.scopesLines.noLines}
                      </div>
                    ) : (
                      offerScope.lines.map((line) => (
                        <div key={line.id} className="rounded-xl border">
                          <div className="flex flex-col gap-3 border-b bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-medium">{line.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {line.parts.length} {dictionary.scopesLines.partsConfigured}
                              </div>
                            </div>
                            <form
                              action={addPartAction.bind(null, id)}
                              className="grid gap-2 sm:grid-cols-[180px_90px_auto] sm:items-end"
                            >
                              <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                              <input type="hidden" name="line_id" value={line.id} />
                              <div className="grid gap-2">
                                <Label htmlFor={`part_id_${line.id}`}>{dictionary.common.part}</Label>
                                <Select name="part_id" disabled={validParts.length === 0}>
                                  <SelectTrigger id={`part_id_${line.id}`}>
                                    <SelectValue placeholder={dictionary.scopesLines.selectPart} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {validParts.map((part) => (
                                      <SelectItem key={part.id} value={part.id}>
                                        {part.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`qty_${line.id}`}>{dictionary.calculation.qty}</Label>
                                <Input
                                  id={`qty_${line.id}`}
                                  name="qty"
                                  min="0.0001"
                                  step="0.0001"
                                  type="number"
                                  required
                                />
                              </div>
                              <Button size="sm" variant="outline">
                                {dictionary.scopesLines.addPart}
                              </Button>
                            </form>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{dictionary.common.part}</TableHead>
                                <TableHead className="text-right">{dictionary.calculation.qty}</TableHead>
                                <TableHead className="hidden md:table-cell text-right">
                                  {dictionary.common.unitPrice}
                                </TableHead>
                                <TableHead className="text-right">{dictionary.scopesLines.lineTotal}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {line.parts.map((linePart) => {
                                const part = partById.get(linePart.partId);
                                const isValidForScope = part?.scopeId === offerScope.scopeId;
                                const unitPrice = unitPrices.get(`${offerScope.scopeId}:${linePart.partId}`) ?? 0;
                                const lineTotal = unitPrice * linePart.qty;

                                return (
                                  <TableRow key={linePart.id}>
                                    <TableCell>
                                      <div className="font-medium">
                                          {part?.name ?? dictionary.scopesLines.unknownPart}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {isValidForScope ? dictionary.scopesLines.validForScope : dictionary.scopesLines.invalidScopePart}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {linePart.qty > 0 ? (
                                        linePart.qty
                                      ) : (
                                          <Badge variant="destructive">{dictionary.common.invalid}</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right">
                                      {formatMoney(unitPrice, offer.currency, locale, 0)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatMoney(lineTotal, offer.currency, locale, 0)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ))
                    )}
                    <div className="rounded-xl border bg-muted/50 p-4">
                      <div className="mb-3 text-sm font-medium">{dictionary.scopesLines.partsAvailableFor.replace("{scope}", scope?.name ?? "")}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {validParts.map((part) => (
                          <div key={part.id} className="rounded-lg border bg-background p-3 text-sm">
                            <div className="font-medium">{part.name}</div>
                            <div className="text-muted-foreground">
                              {formatMoney(unitPrices.get(`${offerScope.scopeId}:${part.id}`) ?? 0, offer.currency, locale, 0)} {dictionary.common.unitPrice}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{dictionary.common.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryRow label={dictionary.common.selectedScopes} value={summary.scopes.toString()} />
            <SummaryRow label={dictionary.offers.linesCount} value={summary.lines.toString()} />
            <SummaryRow label={dictionary.scopesLines.lineParts} value={summary.parts.toString()} />
            <SummaryRow label={dictionary.scopesLines.invalidQuantities} value={summary.invalidQuantities.toString()} />
            <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">{dictionary.overview.calculationStatus}</div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </div>
          </CardContent>
        </Card>
        <OfferFlowProgress offerId={id} currentStep="scopes-lines" completed={flow.completed} dictionary={dictionary.offerFlow} />
        </div>
      </section>
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
