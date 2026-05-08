import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { PageActionBar } from "@/components/page-action-bar";
import { MaterialPricesTable } from "@/components/material-prices-table";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMaterialPricesForOffer, getMaterialPriceSummary } from "@/lib/material-prices";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getOfferById } from "@/lib/offers";
import { getDictionary } from "@/i18n/server";

export default async function MaterialPricesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dictionary = await getDictionary();
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const prices = await getMaterialPricesForOffer(id);
  const summary = await getMaterialPriceSummary(id);
  const flow = await getOfferFlowState(id);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{offer.name} / {dictionary.materialPrices.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PageActionBar
              primary={
                <Button aria-label={dictionary.materialPrices.primaryActionAria}>
                  {dictionary.materialPrices.primaryAction}
                </Button>
              }
              tertiary={
                <Button nativeButton={false} variant="outline" size="sm" aria-label={dictionary.common.backToOverviewAria} render={<Link href={`/offers/${id}/overview`} />}>
                  {dictionary.common.backToOverview}
                </Button>
              }
            />
            <MaterialPricesTable offerId={id} prices={prices} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.common.summary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryRow label={dictionary.common.materials} value={summary.total.toString()} />
              <SummaryRow label={dictionary.materialPrices.overrides} value={summary.overridden.toString()} />
              <SummaryRow label={dictionary.common.unresolved} value={summary.unresolved.toString()} />
              <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
                <div className="text-sm text-muted-foreground">{dictionary.overview.calculationStatus}</div>
                <CalculationStatusBadge status={offer.calculationStatus} />
              </div>
            </CardContent>
          </Card>
          <OfferFlowProgress offerId={id} currentStep="material-prices" completed={flow.completed} dictionary={dictionary.offerFlow} />
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
