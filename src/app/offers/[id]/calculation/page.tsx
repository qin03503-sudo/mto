import { notFound } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

import { calculateOfferAction } from "@/app/offers/[id]/calculation/actions";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { PageActionBar } from "@/components/page-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/currency";
import { getCalculationResults } from "@/lib/calculation";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getOfferById } from "@/lib/offers";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function CalculationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ scope?: string; line?: string; issues?: string; compact?: string; expand?: string }> }) {
  const { id } = await params;
  const { scope, line, issues, compact, expand } = await searchParams;
  const locale = await getLocale(); const dictionary = await getDictionary();
  const offer = await getOfferById(id); if (!offer) notFound();
  const calculation = await getCalculationResults(id); const flow = await getOfferFlowState(id);
  const calcCurrency = "currency" in calculation ? calculation.currency : offer.currency;
  const onlyIssues = issues === "1"; const compactMode = compact === "1"; const expandAll = expand === "1";
  const scopes = calculation.scopes.filter((s) => (!scope || s.scopeId === scope) && s.lines.some((l) => !line || l.lineId === line));
  const unresolved = calculation.issues.length;

  return <AppShell><section className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6"><Card><CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>{offer.name} / {dictionary.calculation.title}</CardTitle></div><CalculationStatusBadge status={offer.calculationStatus} /></CardHeader><CardContent className="space-y-4">
    <form method="get"><FilterBar searchPlaceholder={dictionary.calculation.filterPlaceholder} chips={[{ label: dictionary.offers.linesCount, value: calculation.scopes.reduce((n,s)=>n+s.lines.length,0).toString() }, { label: dictionary.scopesLines.lineParts, value: calculation.scopes.reduce((n,s)=>n+s.lines.reduce((m,l)=>m+l.parts.length,0),0).toString() }, { label: dictionary.calculation.unresolved, value: unresolved.toString() }, { label: dictionary.common.total, value: formatMoney(calculation.total, calcCurrency, locale, 0) }]} extra={<><Button size="sm" variant="outline" nativeButton={false} render={<a href={`?issues=${onlyIssues ? "0" : "1"}&compact=${compactMode ? "1" : "0"}`} />}>{dictionary.calculation.onlyIssues}</Button><Button size="sm" variant="outline" nativeButton={false} render={<a href={`?expand=${expandAll ? "0" : "1"}&compact=${compactMode ? "1" : "0"}`} />}>{expandAll ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</Button></>} /></form>
    <div className="flex flex-wrap gap-2"><form action={calculateOfferAction.bind(null, id)}><Button aria-label={dictionary.pageActions.calculate.aria} disabled={calculation.issues.length > 0}>{dictionary.pageActions.calculate.label}</Button></form><PageActionBar primary={{ key: "review", href: `/offers/${id}/review`, label: dictionary.pageActions.review.label, ariaLabel: dictionary.pageActions.review.aria }} secondary={[{ key: "edit-scopes", href: `/offers/${id}/scopes-lines`, label: dictionary.pageActions.editScopes.label, ariaLabel: dictionary.pageActions.editScopes.aria }, { key: "edit-prices", href: `/offers/${id}/material-prices`, label: dictionary.pageActions.editPrices.label, ariaLabel: dictionary.pageActions.editPrices.aria }]} tertiary={[{ key: "back-overview", href: `/offers/${id}/overview`, label: dictionary.pageActions.backToOverview.label, ariaLabel: dictionary.pageActions.backToOverview.aria }]} /></div>
  </CardContent></Card>
  {scopes.map((s)=><Card key={s.scopeId}><CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>{s.scopeName}</CardTitle><CardDescription>{s.lines.length} {dictionary.calculation.linesConfigured}</CardDescription></div><div className="text-xl font-semibold">{formatMoney(s.total, calcCurrency, locale, 0)}</div></CardHeader><CardContent className="space-y-4">{s.lines.filter((l)=>(!line||l.lineId===line)).map((l)=><div key={l.lineId} className="overflow-hidden rounded-xl border"><div className="flex items-center justify-between border-b bg-muted/40 p-3"><div className="font-medium">{l.lineName}</div><div className="font-medium">{formatMoney(l.total, calcCurrency, locale, 0)}</div></div><Table><TableHeader><TableRow className={compactMode ? "text-xs" : ""}><TableHead>{dictionary.common.part}</TableHead><TableHead className="text-right">{dictionary.calculation.qty}</TableHead><TableHead className="hidden md:table-cell text-right">{dictionary.common.unitPrice}</TableHead><TableHead className="text-right">{dictionary.common.total}</TableHead></TableRow></TableHeader><TableBody>{l.parts.map((p)=><><TableRow key={p.partId} className={compactMode ? "h-8" : ""}><TableCell className="font-medium">{p.partName}</TableCell><TableCell className="text-right">{p.qty}</TableCell><TableCell className="hidden md:table-cell text-right">{formatMoney(p.unitPrice, calcCurrency, locale, 0)}</TableCell><TableCell className="text-right font-medium">{formatMoney(p.total, calcCurrency, locale, 0)}</TableCell></TableRow>{(expandAll && p.details.length>0)?<TableRow key={`${p.partId}-d`}><TableCell colSpan={4} className="bg-muted/30 p-2"><div className="grid gap-2">{p.details.map((d)=><div key={d.mtoRowId} className={`grid rounded-lg border bg-background p-2 text-xs ${compactMode ? "md:grid-cols-[1fr_80px_90px_90px]" : "md:grid-cols-[1fr_100px_120px_120px]"}`}><div className="font-medium">{d.materialName}</div><div className="md:text-right">{d.value}</div><div className="md:text-right">{formatMoney(d.unitPrice, calcCurrency, locale, 0)}</div><div className="font-medium md:text-right">{formatMoney(d.total, calcCurrency, locale, 0)}</div></div>)}</div></TableCell></TableRow>:null}</>)}</TableBody></Table></div>)}</CardContent></Card>)}
</div><div className="space-y-6"><Card className="h-fit"><CardHeader><CardTitle>{dictionary.calculation.run}</CardTitle></CardHeader><CardContent className="space-y-4"><SummaryRow label={dictionary.calculation.runId} value={calculation.id} /><SummaryRow label={dictionary.calculation.offerTotal} value={formatMoney(calculation.total, calcCurrency, locale, 0)} /><SummaryRow label={dictionary.calculation.unresolved} value={unresolved.toString()} /></CardContent></Card><OfferFlowProgress offerId={id} currentStep="calculation" completed={flow.completed} dictionary={dictionary.offerFlow} /></div></section></AppShell>;
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="space-y-1 rounded-xl border bg-muted/40 p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="break-words font-medium">{value}</div></div>; }
