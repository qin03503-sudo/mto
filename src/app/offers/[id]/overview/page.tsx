import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, Layers3, PackageCheck, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { OfferFlowProgress } from "@/components/offer-flow-progress";
import { PageActionBar } from "@/components/page-action-bar";
import {
  CalculationStatusBadge,
  OfferStatusBadge,
} from "@/components/offer-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { getOfferById } from "@/lib/offers";
import { getMaterialPriceSummary } from "@/lib/material-prices";
import { getScopeLineSummary } from "@/lib/scopes-lines";
import { getOfferFlowState } from "@/lib/offer-flow";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function OfferOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const materialSummary = await getMaterialPriceSummary(id);
  const scopeSummary = await getScopeLineSummary(id);
  const flow = await getOfferFlowState(id);

  return (
    <AppShell>
      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardDescription>{offer.offerNumber}</CardDescription>
            <CardTitle className="text-2xl">{offer.name}</CardTitle>
            <CardDescription>{offer.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label={dictionary.common.type} value={offer.type === "custom" ? dictionary.offers.custom : dictionary.offers.standard} />
            <Info label={dictionary.common.owner} value={offer.owner} />
            <Info label={dictionary.common.inputDate} value={offer.inputDate} />
            <Info label={dictionary.common.closeDate} value={offer.closeDate} />
            <Info
              label={dictionary.common.total}
              value={
                offer.calculationStatus === "current"
                  ? formatMoney(offer.total, offer.currency, locale, 0)
                  : "—"
              }
            />
            <Info label={dictionary.overview.configuredScopeLine} value={`${scopeSummary.scopes} ${dictionary.offers.scopesCount} / ${scopeSummary.lines} ${dictionary.offers.linesCount}`} />
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">{dictionary.overview.offerStatus}</div>
              <OfferStatusBadge status={offer.status} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">{dictionary.overview.calculationStatus}</div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{dictionary.overview.actions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WorkflowCard
                href={`/offers/${offer.id}/material-prices`}
                icon={<PackageCheck className="size-4" />}
                label={dictionary.overview.materialPrices}
                detail={dictionary.overview.materialPricesDetail.replace("{unresolved}", materialSummary.unresolved.toString()).replace("{overridden}", materialSummary.overridden.toString())}
              />
              <WorkflowCard
                href={`/offers/${offer.id}/scopes-lines`}
                icon={<Layers3 className="size-4" />}
                label={dictionary.overview.scopesAndLines}
                detail={dictionary.overview.scopesAndLinesDetail.replace("{parts}", scopeSummary.parts.toString())}
              />
              <WorkflowCard
                href={`/offers/${offer.id}/calculation`}
                icon={<Calculator className="size-4" />}
                label={dictionary.offers.calculation}
                detail={dictionary.overview.calculationDetail.replace("{status}", dictionary.statuses[offer.calculationStatus])}
              />
              <WorkflowCard
                href={`/offers/${offer.id}/review`}
                icon={<ShieldCheck className="size-4" />}
                label={dictionary.review.title}
                detail={dictionary.review.stepDetail}
              />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{dictionary.overview.pageActionsTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <PageActionBar
                primary={
                  <Button nativeButton={false} aria-label={dictionary.overview.primaryActionAria} render={<Link href={`/offers/${offer.id}/calculation`} />}>
                    {dictionary.common.calculate}
                  </Button>
                }
                secondary={
                  <>
                    <Button nativeButton={false} size="sm" variant="outline" aria-label={dictionary.overview.secondaryMaterialPricesAria} render={<Link href={`/offers/${offer.id}/material-prices`} />}>
                      {dictionary.overview.materialPrices}
                    </Button>
                    <Button nativeButton={false} size="sm" variant="outline" aria-label={dictionary.overview.secondaryScopesLinesAria} render={<Link href={`/offers/${offer.id}/scopes-lines`} />}>
                      {dictionary.overview.scopesAndLines}
                    </Button>
                  </>
                }
                tertiary={
                  <Button nativeButton={false} size="sm" variant="ghost" aria-label={dictionary.overview.tertiaryReviewAria} render={<Link href={`/offers/${offer.id}/review`} />}>
                    {dictionary.review.title}
                  </Button>
                }
              />
            </CardContent>
          </Card>
          <OfferFlowProgress
            offerId={id}
            currentStep="overview"
            completed={flow.completed}
            dictionary={dictionary.offerFlow}
          />
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium capitalize">{value}</div>
    </div>
  );
}

function WorkflowCard({
  href,
  icon,
  label,
  detail,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-4 transition hover:bg-muted">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
    </Link>
  );
}
