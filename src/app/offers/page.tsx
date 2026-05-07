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
import { getOfferSummary, getOffers } from "@/lib/offers";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function OffersPage() {
  const offers = await getOffers();
  const summary = await getOfferSummary();
  const currentOffers = offers.filter((offer) => offer.calculationStatus === "current").length;
  const completionRate = Math.round((currentOffers / Math.max(offers.length, 1)) * 100);

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Active offers"
          value={summary.activeOffers.toString()}
          description="Offers in the current pipeline"
          icon={<ClipboardList className="size-4" />}
        />
        <MetricCard
          title="Open value"
          value={currencyFormatter.format(summary.openValue)}
          description="Total value across active offers"
          icon={<TrendingUp className="size-4" />}
        />
        <MetricCard
          title="Outdated calculations"
          value={summary.outdatedCalculations.toString()}
          description="Need recalculation after data changes"
          icon={<AlertTriangle className="size-4" />}
        />
        <MetricCard
          title="Configured lines"
          value={summary.linesConfigured.toString()}
          description="Line entries ready for part pricing"
          icon={<GitBranch className="size-4" />}
        />
        <MetricCard
          title="Current calculations"
          value={`${completionRate}%`}
          description="Offers with up-to-date calculation output"
          icon={<TrendingUp className="size-4" />}
        />
      </section>

      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Offer Workbench</CardTitle>
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
