import Link from "next/link";
import { notFound } from "next/navigation";

import { markOfferReadyAction, recalculateOfferAction } from "@/app/offers/[id]/review/actions";
import { AppShell } from "@/components/app-shell";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { CalculationStatusBadge, OfferStatusBadge } from "@/components/offer-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { getCalculationResults } from "@/lib/calculation";
import { getMaterialPriceSummary } from "@/lib/material-prices";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getOfferById } from "@/lib/offers";
import { getScopeLineSummary } from "@/lib/scopes-lines";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function OfferReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const offer = await getOfferById(id);

  if (!offer) notFound();

  const [materialSummary, scopeSummary, calculation, flow] = await Promise.all([
    getMaterialPriceSummary(id),
    getScopeLineSummary(id),
    getCalculationResults(id),
    getOfferFlowState(id),
  ]);

  const hasMissingScopesLinesParts =
    scopeSummary.scopes === 0 || scopeSummary.lines === 0 || scopeSummary.parts === 0 || scopeSummary.invalidQuantities > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <OfferFlowProgress offerId={id} currentStep="review-export" completed={flow.completed} dictionary={dictionary.offerFlow} />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardDescription>{offer.offerNumber}</CardDescription>
                <CardTitle>{dictionary.review.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Info label={dictionary.review.offerStatus} value={<OfferStatusBadge status={offer.status} />} />
                <Info label={dictionary.review.calculationStatus} value={<CalculationStatusBadge status={offer.calculationStatus} />} />
                <Info label={dictionary.review.materialOverrides} value={`${materialSummary.overridden}`} />
                <Info label={dictionary.review.unresolvedMaterials} value={`${materialSummary.unresolved}`} />
                <Info label={dictionary.review.completeness} value={`${scopeSummary.scopes} / ${scopeSummary.lines} / ${scopeSummary.parts}`} />
                <Info label={dictionary.review.lastRun} value={calculation.runAt} />
                <Info label={dictionary.review.lastRunStatus} value={dictionary.statuses[calculation.status]} />
                <Info label={dictionary.review.offerTotal} value={formatMoney(calculation.total, calculation.currency, locale, 0)} />
              </CardContent>
            </Card>

            {materialSummary.unresolved > 0 ? <Alert tone="danger" title={dictionary.review.unresolvedBlockTitle} description={dictionary.review.unresolvedBlockDescription.replace("{count}", String(materialSummary.unresolved))} /> : null}
            {calculation.status !== "current" ? <Alert tone="warn" title={dictionary.review.outdatedBlockTitle} description={dictionary.review.outdatedBlockDescription} /> : null}
            {hasMissingScopesLinesParts ? <Alert tone="danger" title={dictionary.review.missingBlockTitle} description={dictionary.review.missingBlockDescription.replace("{scopes}", String(scopeSummary.scopes)).replace("{lines}", String(scopeSummary.lines)).replace("{parts}", String(scopeSummary.parts)).replace("{invalid}", String(scopeSummary.invalidQuantities))} /> : null}
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card>
            <CardHeader>
              <CardTitle>{dictionary.review.actionsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form action={recalculateOfferAction.bind(null, id)}>
                <Button className="w-full">{dictionary.review.recalculate}</Button>
              </form>
              <form action={markOfferReadyAction.bind(null, id)}>
                <Button
                  className="w-full"
                  disabled={materialSummary.unresolved > 0 || calculation.status !== "current" || hasMissingScopesLinesParts}
                  variant="secondary"
                >
                  {dictionary.review.markReady}
                </Button>
              </form>
              <Button className="w-full" variant="outline" disabled>
                {dictionary.review.generateExport}
              </Button>
              <Button nativeButton={false} className="w-full" variant="ghost" render={<Link href={`/offers/${id}/calculation`} />}>
                {dictionary.review.backToCalculation}
              </Button>
            </CardContent>
          </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function Alert({ title, description, tone }: { title: string; description: string; tone: "danger" | "warn" }) {
  const classes = tone === "danger" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200";

  return (
    <div className={`rounded-xl border p-4 ${classes}`}>
      <div className="font-medium">{title}</div>
      <div className="text-sm">{description}</div>
    </div>
  );
}
