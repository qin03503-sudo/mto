import {
  AlertTriangle,
  ClipboardList,
  GitBranch,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { OffersTable } from "@/components/offers-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { getOfferSummary, getOffers } from "@/lib/offers";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function OffersPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const offers = await getOffers();
  const summary = await getOfferSummary();
  const currentOffers = offers.filter((offer) => offer.calculationStatus === "current").length;
  const completionRate = Math.round((currentOffers / Math.max(offers.length, 1)) * 100);

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title={dictionary.offers.activeOffers}
          value={summary.activeOffers.toString()}
          description={dictionary.offers.activeOffersDescription}
          icon={<ClipboardList className="size-4" />}
        />
        <MetricCard
          title={dictionary.offers.openValue}
          value={formatMoney(summary.openValue, summary.openValueCurrency, locale, 0)}
          description={dictionary.offers.openValueDescription}
          icon={<TrendingUp className="size-4" />}
        />
        <MetricCard
          title={dictionary.offers.outdatedCalculations}
          value={summary.outdatedCalculations.toString()}
          description={dictionary.offers.outdatedCalculationsDescription}
          icon={<AlertTriangle className="size-4" />}
        />
        <MetricCard
          title={dictionary.offers.configuredLines}
          value={summary.linesConfigured.toString()}
          description={dictionary.offers.configuredLinesDescription}
          icon={<GitBranch className="size-4" />}
        />
        <MetricCard
          title={dictionary.offers.currentCalculations}
          value={`${completionRate}%`}
          description={dictionary.offers.currentCalculationsDescription}
          icon={<TrendingUp className="size-4" />}
        />
      </section>

      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{dictionary.offers.workbench}</CardTitle>
          </CardHeader>
          <CardContent>
            <OffersTable offers={offers} />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}
