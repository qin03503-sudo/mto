import { AppShell } from "@/components/app-shell";
import { OfferManagementView } from "@/components/offer-management-view";
import { getDictionary } from "@/i18n/server";
import { getOffers, getOfferSummary } from "@/lib/offers";

export default async function ReportsPage() {
  const [dictionary, offers, summary] = await Promise.all([getDictionary(), getOffers(), getOfferSummary()]);

  return (
    <AppShell>
      <OfferManagementView
        offers={offers}
        savedFilters={{ status: "all", date: "all" }}
        showKpis
        title={dictionary.management.reportsTitle}
        description={`${dictionary.management.reportsDescription} · ${summary.activeOffers} ${dictionary.offers.activeOffers.toLowerCase()} · ${summary.outdatedCalculations} ${dictionary.offers.outdatedCalculations.toLowerCase()}`}
        emptyTitle={dictionary.management.reportsEmptyTitle}
        emptyDescription={dictionary.management.reportsEmptyDescription}
      />
    </AppShell>
  );
}
