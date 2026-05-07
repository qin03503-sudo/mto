import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
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
import { getOfferById } from "@/lib/offers";

export default async function MaterialPricesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const prices = await getMaterialPricesForOffer(id);
  const summary = await getMaterialPriceSummary(id);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{offer.name} / Material Prices</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button nativeButton={false} variant="outline" size="sm" render={<Link href={`/offers/${id}/overview`} />}>
                Back to overview
              </Button>
            </div>
            <MaterialPricesTable offerId={id} prices={prices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryRow label="Materials" value={summary.total.toString()} />
            <SummaryRow label="Overrides" value={summary.overridden.toString()} />
            <SummaryRow label="Unresolved" value={summary.unresolved.toString()} />
            <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">Calculation status</div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </div>
          </CardContent>
        </Card>
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
