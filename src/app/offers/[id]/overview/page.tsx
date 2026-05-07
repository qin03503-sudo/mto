import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, Layers3, PackageCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
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
import { getOfferById } from "@/lib/offers";
import { getMaterialPriceSummary } from "@/lib/material-prices";
import { getScopeLineSummary } from "@/lib/scopes-lines";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function OfferOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const materialSummary = await getMaterialPriceSummary(id);
  const scopeSummary = await getScopeLineSummary(id);

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
            <Info label="Type" value={offer.type} />
            <Info label="Owner" value={offer.owner} />
            <Info label="Input date" value={offer.inputDate} />
            <Info label="Close date" value={offer.closeDate} />
            <Info label="Total" value={currencyFormatter.format(offer.total)} />
            <Info label="Configured scope/line" value={`${scopeSummary.scopes} scopes / ${scopeSummary.lines} lines`} />
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Offer status</div>
              <OfferStatusBadge status={offer.status} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Calculation status</div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WorkflowCard
              href={`/offers/${offer.id}/material-prices`}
              icon={<PackageCheck className="size-4" />}
              label="Material Prices"
              detail={`${materialSummary.unresolved} unresolved / ${materialSummary.overridden} overrides`}
            />
            <WorkflowCard
              href={`/offers/${offer.id}/scopes-lines`}
              icon={<Layers3 className="size-4" />}
              label="Scopes And Lines"
              detail={`${scopeSummary.parts} line parts configured`}
            />
            <WorkflowCard
              href={`/offers/${offer.id}/calculation`}
              icon={<Calculator className="size-4" />}
              label="Calculation"
              detail={`${offer.calculationStatus.replace("_", " ")} status`}
            />
          </CardContent>
        </Card>
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
