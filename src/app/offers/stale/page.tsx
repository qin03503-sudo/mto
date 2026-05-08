import { AppShell } from "@/components/app-shell";
import { OfferManagementView } from "@/components/offer-management-view";
import { getDictionary } from "@/i18n/server";
import { getOffers } from "@/lib/offers";

export default async function OffersStalePage() {
  const [dictionary, offers] = await Promise.all([getDictionary(), getOffers()]);
  const filtered = offers.filter((offer) => offer.calculationStatus === "outdated" || offer.calculationStatus === "not_calculated");

  return (
    <AppShell>
      <OfferManagementView
        offers={filtered}
        savedFilters={{ status: "pricing", date: "7" }}
        title={dictionary.management.staleTitle}
        description={dictionary.management.staleDescription}
        emptyTitle={dictionary.management.staleEmptyTitle}
        emptyDescription={dictionary.management.staleEmptyDescription}
      />
    </AppShell>
  );
}
