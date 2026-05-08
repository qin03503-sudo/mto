import { notFound } from "next/navigation";
import { AlertTriangle, CircleCheck, Layers3, PackageSearch, Plus, Trash2 } from "lucide-react";

import {
  addLineAction,
  addPartAction,
  addScopeAction,
  removeLineAction,
  removeLinePartAction,
  removeScopeAction,
  updateLineAction,
  updateLinePartQtyAction,
} from "@/app/offers/[id]/scopes-lines/actions";
import { AppShell } from "@/components/app-shell";
import { CollapsibleSection } from "@/components/collapsible-section";
import { FilterBar } from "@/components/filter-bar";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { PageActionBar } from "@/components/page-action-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatMoney, type PriceCurrency } from "@/lib/currency";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getOfferById } from "@/lib/offers";
import { getOfferScopes, getPartUnitPrice, getPartsForScope, getScopeLineSummary, getScopes, type OfferLine, type Part } from "@/lib/scopes-lines";

type ScopesLinesDictionary = Awaited<ReturnType<typeof getDictionary>>;

export default async function ScopesLinesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; q?: string; collapsed?: string }> }) {
  const { id } = await params;
  const { error, q, collapsed } = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const query = (q ?? "").trim().toLowerCase();
  const collapsedScopeIds = new Set((collapsed ?? "").split(",").filter(Boolean));
  const offer = await getOfferById(id);
  if (!offer) notFound();

  const [offerScopes, summary, allScopes, flow] = await Promise.all([getOfferScopes(id), getScopeLineSummary(id), getScopes(), getOfferFlowState(id)]);
  const scopeById = new Map(allScopes.map((scope) => [scope.id, scope]));
  const partsByScopeEntries = await Promise.all(offerScopes.map(async (offerScope) => [offerScope.scopeId, await getPartsForScope(offerScope.scopeId)] as const));
  const partsByScope = new Map(partsByScopeEntries);
  const partById = new Map(partsByScopeEntries.flatMap(([, parts]) => parts.map((part) => [part.id, part] as const)));
  const selectedScopeIds = new Set(offerScopes.map((scope) => scope.scopeId));
  const availableScopes = allScopes.filter((scope) => !selectedScopeIds.has(scope.id));
  const unitPrices = new Map(await Promise.all(offerScopes.flatMap((offerScope) => {
    const validParts = partsByScope.get(offerScope.scopeId) ?? [];
    const partIds = new Set([...validParts.map((part) => part.id), ...offerScope.lines.flatMap((line) => line.parts.map((part) => part.partId))]);
    return Array.from(partIds).map(async (partId) => [`${offerScope.scopeId}:${partId}`, await getPartUnitPrice(id, offerScope.scopeId, partId)] as const);
  })));

  const filteredScopes = offerScopes.filter((offerScope) => {
    if (!query) return true;
    const scope = scopeById.get(offerScope.scopeId);
    return offerScope.lines.some((line) => line.name.toLowerCase().includes(query) || line.parts.some((p) => partById.get(p.partId)?.name.toLowerCase().includes(query))) || scope?.name.toLowerCase().includes(query);
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <OfferFlowProgress offerId={id} currentStep="scopes-lines" completed={flow.completed} dictionary={dictionary.offerFlow} />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-background via-background to-primary/5">
              <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Layers3 className="size-3" />
                      {dictionary.offerFlow.steps["scopes-lines"]}
                    </Badge>
                    <CalculationStatusBadge status={offer.calculationStatus} />
                  </div>
                  <CardTitle className="text-2xl">{offer.name} / {dictionary.scopesLines.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">{dictionary.scopesLines.editingHint}</CardDescription>
                </div>
                <PageActionBar className="lg:justify-end" primary={{ key: "calculate", href: `/offers/${id}/calculation`, label: dictionary.pageActions.calculate.label, ariaLabel: dictionary.pageActions.calculate.aria }} secondary={[{ key: "edit-prices", href: `/offers/${id}/material-prices`, label: dictionary.pageActions.editPrices.label, ariaLabel: dictionary.pageActions.editPrices.aria }]} tertiary={[{ key: "back-overview", href: `/offers/${id}/overview`, label: dictionary.pageActions.backToOverview.label, ariaLabel: dictionary.pageActions.backToOverview.aria }]} />
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label={dictionary.common.selectedScopes} value={summary.scopes.toString()} />
                  <MetricCard label={dictionary.offers.linesCount} value={summary.lines.toString()} />
                  <MetricCard label={dictionary.scopesLines.lineParts} value={summary.parts.toString()} tone={summary.invalidQuantities > 0 ? "warning" : "success"} />
                </div>
                <form method="get">
                  <FilterBar searchPlaceholder={dictionary.scopesLines.searchLinesParts} searchValue={q} chips={[{ label: dictionary.scopesLines.invalidQuantities, value: summary.invalidQuantities.toString() }, { label: dictionary.common.scopes, value: `${summary.scopes}/${allScopes.length}` }]} />
                </form>
                <div className="flex flex-wrap gap-2">
                  {allScopes.map((scope) => <Badge key={scope.id} variant={selectedScopeIds.has(scope.id) ? "default" : "outline"} className="h-7 px-3">{scope.name}</Badge>)}
                </div>
              </CardContent>
            </Card>

            {filteredScopes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                    <PackageSearch className="size-5" />
                  </div>
                  <div className="font-medium text-foreground">{offerScopes.length === 0 ? dictionary.scopesLines.noScopesSelected : dictionary.scopesLines.noMatchingScopes}</div>
                  <div className="mt-1">{offerScopes.length === 0 ? dictionary.scopesLines.calculationBlockedNoScopes : dictionary.scopesLines.searchLinesParts}</div>
                </CardContent>
              </Card>
            ) : null}

            {filteredScopes.map((offerScope) => {
              const scope = scopeById.get(offerScope.scopeId);
              const validParts = partsByScope.get(offerScope.scopeId) ?? [];
              const collapsedSet = new Set(collapsedScopeIds);
              const isCollapsed = collapsedSet.has(offerScope.scopeId);
              const next = isCollapsed ? [...collapsedSet].filter((x) => x !== offerScope.scopeId) : [...collapsedSet, offerScope.scopeId];

              return (
                <Card key={offerScope.id} className="overflow-hidden">
                  <CardHeader className="gap-4 border-b bg-muted/20 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        {scope?.name ?? dictionary.scopesLines.unknownScope}
                        <Badge variant="outline">{offerScope.lines.length} {dictionary.calculation.linesConfigured}</Badge>
                        <Badge variant="outline">{validParts.length} {dictionary.common.parts}</Badge>
                      </CardTitle>
                      <CardDescription>{scope?.description ?? dictionary.scopesLines.missingScopeData}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <form action={addLineAction.bind(null, id)} className="flex flex-col gap-2 rounded-xl border bg-background/80 p-3 sm:flex-row sm:items-end">
                        <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                        <div className="grid gap-2">
                          <Label htmlFor={`line_name_${offerScope.id}`}>{dictionary.scopesLines.lineName}</Label>
                          <Input id={`line_name_${offerScope.id}`} name="line_name" placeholder={dictionary.scopesLines.linePlaceholder} required />
                        </div>
                        <Button type="submit" size="sm" variant="outline">
                          <Plus className="size-3" />
                          {dictionary.scopesLines.addLine}
                        </Button>
                      </form>
                      <form action={removeScopeAction.bind(null, id)}>
                        <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                        <Button type="submit" size="sm" variant="destructive" title={dictionary.scopesLines.removeScope}>
                          <Trash2 className="size-3" />
                          {dictionary.scopesLines.removeScope}
                        </Button>
                      </form>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CollapsibleSection id={`scope-${offerScope.scopeId}`} title={dictionary.scopesLines.scopeLines} description={`${offerScope.lines.length} ${dictionary.calculation.linesConfigured}`} collapsed={isCollapsed} toggleHref={buildToggleHref(q, next)}>
                      {offerScope.lines.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">{dictionary.scopesLines.noLines}</div>
                      ) : (
                        <div className="space-y-4 p-3">
                          {offerScope.lines.map((line) => <LinePartLocation key={line.id} offerId={id} offerScopeId={offerScope.id} scopeId={offerScope.scopeId} line={line} validParts={validParts} partById={partById} unitPrices={unitPrices} currency={offer.currency} locale={locale} dictionary={dictionary} />)}
                        </div>
                      )}
                    </CollapsibleSection>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.scopesLines.addScope}</CardTitle>
                <CardDescription>{dictionary.scopesLines.editingHint}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={addScopeAction.bind(null, id)} className="grid gap-3 rounded-xl border bg-muted/30 p-3">
                  <div className="grid gap-2">
                    <Label htmlFor="scope_id">{dictionary.scopesLines.selectScope}</Label>
                    <Select name="scope_id" required disabled={availableScopes.length === 0}>
                      <SelectTrigger id="scope_id" className="w-full">
                        <SelectValue placeholder={dictionary.scopesLines.selectScope} />
                      </SelectTrigger>
                      <SelectContent>{availableScopes.map((scope) => <SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={availableScopes.length === 0}>{dictionary.scopesLines.addScopeButton}</Button>
                </form>
                <PageActionBar className="flex-col items-stretch" primary={{ key: "calculate", href: `/offers/${id}/calculation`, label: dictionary.pageActions.calculate.label, ariaLabel: dictionary.pageActions.calculate.aria }} secondary={[{ key: "edit-prices", href: `/offers/${id}/material-prices`, label: dictionary.pageActions.editPrices.label, ariaLabel: dictionary.pageActions.editPrices.aria }]} tertiary={[{ key: "back-overview", href: `/offers/${id}/overview`, label: dictionary.pageActions.backToOverview.label, ariaLabel: dictionary.pageActions.backToOverview.aria }]} />
              </CardContent>
            </Card>

            <Card id="scopes-issues">
              <CardHeader>
                <CardTitle>{dictionary.common.summary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function buildToggleHref(q: string | undefined, collapsed: string[]) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (collapsed.length > 0) params.set("collapsed", collapsed.join(","));
  const query = params.toString();

  return query ? `?${query}` : "?";
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <div className="rounded-xl border bg-background/75 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {tone === "success" ? <CircleCheck className="size-4 text-emerald-600" /> : null}
        {tone === "warning" ? <AlertTriangle className="size-4 text-amber-600" /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4"><span className="text-sm text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function LinePartLocation({ offerId, offerScopeId, scopeId, line, validParts, partById, unitPrices, currency, locale, dictionary }: { offerId: string; offerScopeId: string; scopeId: string; line: OfferLine; validParts: Part[]; partById: Map<string, Part>; unitPrices: Map<string, number>; currency: PriceCurrency; locale: string; dictionary: ScopesLinesDictionary }) {
  const lineTotal = line.parts.reduce((total, linePart) => total + (unitPrices.get(`${scopeId}:${linePart.partId}`) ?? 0) * linePart.qty, 0);

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-muted/30 p-4 lg:flex-row lg:items-center lg:justify-between">
        <form action={updateLineAction.bind(null, offerId)} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="offer_scope_id" value={offerScopeId} />
          <input type="hidden" name="line_id" value={line.id} />
          <div className="grid min-w-[220px] flex-1 gap-2">
            <Label htmlFor={`edit_line_name_${line.id}`}>{dictionary.scopesLines.lineName}</Label>
            <Input id={`edit_line_name_${line.id}`} name="line_name" defaultValue={line.name} required />
          </div>
          <Button type="submit" size="sm" variant="outline">{dictionary.common.save}</Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={line.parts.length > 0 ? "default" : "outline"}>{line.parts.length} {dictionary.scopesLines.partsConfigured}</Badge>
          <Badge variant="secondary">{formatMoney(lineTotal, currency, locale, 0)}</Badge>
          <form action={removeLineAction.bind(null, offerId)}>
            <input type="hidden" name="offer_scope_id" value={offerScopeId} />
            <input type="hidden" name="line_id" value={line.id} />
            <Button type="submit" size="sm" variant="destructive" title={dictionary.scopesLines.removeLine}>
              <Trash2 className="size-3" />
              {dictionary.scopesLines.removeLine}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(260px,340px)_1fr]">
        <div className="rounded-xl border bg-muted/25 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageSearch className="size-4" />
            </div>
            <div className="space-y-1">
              <div className="font-medium">{dictionary.scopesLines.partPlacementTitle}</div>
              <p className="text-xs leading-5 text-muted-foreground">{dictionary.scopesLines.partPlacementHint}</p>
            </div>
          </div>

          <form action={addPartAction.bind(null, offerId)} className="mt-4 grid gap-3">
            <input type="hidden" name="offer_scope_id" value={offerScopeId} />
            <input type="hidden" name="line_id" value={line.id} />
            <div className="grid gap-2">
              <Label htmlFor={`part_id_${line.id}`}>{dictionary.common.part}</Label>
              <Select name="part_id" required disabled={validParts.length === 0}>
                <SelectTrigger id={`part_id_${line.id}`} className="w-full">
                  <SelectValue placeholder={dictionary.scopesLines.selectPart} />
                </SelectTrigger>
                <SelectContent>
                  {validParts.map((part) => <SelectItem key={part.id} value={part.id}>{part.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`qty_${line.id}`}>{dictionary.calculation.qty}</Label>
              <Input id={`qty_${line.id}`} name="qty" min="0.0001" placeholder={dictionary.scopesLines.quantityPlaceholder} step="0.0001" type="number" required />
            </div>
            <Button type="submit" className="w-full" disabled={validParts.length === 0} variant="outline">
              <Plus className="size-3" />
              {dictionary.scopesLines.addPart}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/25 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{dictionary.scopesLines.availablePartsTitle}</div>
                <div className="text-xs text-muted-foreground">{dictionary.scopesLines.availablePartsCount.replace("{count}", String(validParts.length))}</div>
              </div>
              <Badge variant="outline">{validParts.length} {dictionary.common.parts}</Badge>
            </div>
            {validParts.length > 0 ? <div className="flex flex-wrap gap-2">{validParts.map((part) => <Badge key={part.id} variant="outline" className="h-7 rounded-lg bg-background px-3">{part.name}</Badge>)}</div> : <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">{dictionary.scopesLines.noPartsForScope}</div>}
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
              <div className="font-medium">{dictionary.scopesLines.currentLineParts}</div>
              <Badge variant="secondary">{formatMoney(lineTotal, currency, locale, 0)}</Badge>
            </div>
            {line.parts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{dictionary.scopesLines.noLineParts}</div>
                <div className="mt-1">{dictionary.scopesLines.addFirstPart}</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.common.part}</TableHead>
                      <TableHead className="text-right">{dictionary.calculation.qty}</TableHead>
                      <TableHead className="hidden text-right md:table-cell">{dictionary.common.unitPrice}</TableHead>
                      <TableHead className="text-right">{dictionary.scopesLines.lineTotal}</TableHead>
                      <TableHead className="w-[190px] text-right">{dictionary.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {line.parts.map((linePart) => {
                      const part = partById.get(linePart.partId);
                      const isValidForScope = part?.scopeId === scopeId;
                      const invalidRow = !isValidForScope || linePart.qty <= 0;
                      const unitPrice = unitPrices.get(`${scopeId}:${linePart.partId}`) ?? 0;
                      const rowTotal = unitPrice * linePart.qty;

                      return (
                        <TableRow key={linePart.id} className={invalidRow ? "bg-amber-50/50" : ""}>
                          <TableCell>
                            <div className="font-medium">{part?.name ?? dictionary.scopesLines.unknownPart}</div>
                            <div className="text-xs text-muted-foreground">{isValidForScope ? dictionary.scopesLines.validForScope : dictionary.scopesLines.invalidScopePart}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            {linePart.qty > 0 ? linePart.qty : <Badge variant="destructive">{dictionary.common.invalid}</Badge>}
                          </TableCell>
                          <TableCell className="hidden text-right md:table-cell">{formatMoney(unitPrice, currency, locale, 0)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {invalidRow ? <a href="#scopes-issues" className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="size-4" />{formatMoney(rowTotal, currency, locale, 0)}</a> : formatMoney(rowTotal, currency, locale, 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <form action={updateLinePartQtyAction.bind(null, offerId)} className="flex items-center gap-2">
                                <input type="hidden" name="offer_scope_id" value={offerScopeId} />
                                <input type="hidden" name="line_id" value={line.id} />
                                <input type="hidden" name="line_part_id" value={linePart.id} />
                                <Label className="sr-only" htmlFor={`qty_${linePart.id}`}>{dictionary.scopesLines.updateQuantity}</Label>
                                <Input id={`qty_${linePart.id}`} name="qty" defaultValue={linePart.qty} min="0.0001" step="0.0001" type="number" required className="w-20" />
                                <Button type="submit" size="sm" variant="outline">{dictionary.common.save}</Button>
                              </form>
                              <form action={removeLinePartAction.bind(null, offerId)}>
                                <input type="hidden" name="offer_scope_id" value={offerScopeId} />
                                <input type="hidden" name="line_id" value={line.id} />
                                <input type="hidden" name="line_part_id" value={linePart.id} />
                                <Button type="submit" size="icon-sm" variant="destructive" title={dictionary.scopesLines.removePart}>
                                  <Trash2 className="size-3" />
                                </Button>
                              </form>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
