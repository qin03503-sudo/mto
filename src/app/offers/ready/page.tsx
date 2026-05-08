import { AppShell } from "@/components/app-shell";
import { OfferManagementView } from "@/components/offer-management-view";
import { getDictionary } from "@/i18n/server";
import { getOffers } from "@/lib/offers";

export default async function OffersReadyPage() {
  const [dictionary, offers] = await Promise.all([getDictionary(), getOffers()]);
  const filtered = offers.filter((offer) => offer.status === "ready" && offer.calculationStatus === "current");

  return (
    <AppShell>
      <OfferManagementView
        offers={filtered}
        savedFilters={{ status: "ready", date: "14" }}
        title={dictionary.management.readyTitle}
        description={dictionary.management.readyDescription}
        emptyTitle={dictionary.management.readyEmptyTitle}
        emptyDescription={dictionary.management.readyEmptyDescription}
      />
    </AppShell>
  );
}
