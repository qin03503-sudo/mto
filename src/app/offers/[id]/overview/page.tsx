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
      <div className="space-y-6">
        <OfferFlowProgress
          offerId={id}
          currentStep="overview"
          completed={flow.completed}
          dictionary={dictionary.offerFlow}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardDescription>{offer.offerNumber}</CardDescription>
                  <CardTitle className="text-2xl">{offer.name}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <OfferStatusBadge status={offer.status} />
                  <CalculationStatusBadge status={offer.calculationStatus} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{dictionary.overview.actions}</CardTitle>
                <CardDescription>{dictionary.overview.editingGuide}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
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
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{dictionary.common.actions}</CardTitle>
              </CardHeader>
              <CardContent>
                <PageActionBar
                  className="flex-col items-stretch"
                  primary={{ key: "material-prices", href: `/offers/${offer.id}/material-prices`, label: dictionary.pageActions.materialPrices.label, ariaLabel: dictionary.pageActions.materialPrices.aria }}
                  secondary={[
                    { key: "scopes-lines", href: `/offers/${offer.id}/scopes-lines`, label: dictionary.pageActions.editScopes.label, ariaLabel: dictionary.pageActions.editScopes.aria },
                    { key: "calculation", href: `/offers/${offer.id}/calculation`, label: dictionary.pageActions.calculate.label, ariaLabel: dictionary.pageActions.calculate.aria },
                  ]}
                  tertiary={[{ key: "review", href: `/offers/${offer.id}/review`, label: dictionary.pageActions.review.label, ariaLabel: dictionary.pageActions.review.aria }]}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{dictionary.common.summary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Info label={dictionary.overview.offerStatus} value={<OfferStatusBadge status={offer.status} />} />
                <Info label={dictionary.overview.calculationStatus} value={<CalculationStatusBadge status={offer.calculationStatus} />} />
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
    <Link href={href} className="flex h-full items-start gap-3 rounded-2xl border bg-muted/30 p-4 transition hover:border-primary/30 hover:bg-muted">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-sm leading-5 text-muted-foreground">{detail}</div>
      </div>
    </Link>
  );
}
