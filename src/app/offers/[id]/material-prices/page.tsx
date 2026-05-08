import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { MaterialPricesTable } from "@/components/material-prices-table";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { PageActionBar } from "@/components/page-action-bar";
import {
  Card,
  CardContent,
  CardDescription,
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
      <div className="space-y-6">
        <OfferFlowProgress offerId={id} currentStep="material-prices" completed={flow.completed} dictionary={dictionary.offerFlow} />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader>
              <CardTitle>{offer.name} / {dictionary.materialPrices.title}</CardTitle>
              <CardDescription>{dictionary.materialPrices.editingHint}</CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialPricesTable offerId={id} prices={prices} />
            </CardContent>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.common.actions}</CardTitle>
              </CardHeader>
              <CardContent>
                <PageActionBar
                  className="flex-col items-stretch"
                  primary={{ key: "calculate", href: `/offers/${id}/calculation`, label: dictionary.pageActions.calculate.label, ariaLabel: dictionary.pageActions.calculate.aria }}
                  secondary={[{ key: "edit-scopes", href: `/offers/${id}/scopes-lines`, label: dictionary.pageActions.editScopes.label, ariaLabel: dictionary.pageActions.editScopes.aria }]}
                  tertiary={[{ key: "back-overview", href: `/offers/${id}/overview`, label: dictionary.pageActions.backToOverview.label, ariaLabel: dictionary.pageActions.backToOverview.aria }]}
                />
              </CardContent>
            </Card>

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
          </div>
        </section>
      </div>
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
