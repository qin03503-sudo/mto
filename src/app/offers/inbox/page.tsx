import { AppShell } from "@/components/app-shell";
import { OfferManagementView } from "@/components/offer-management-view";
import { getDictionary } from "@/i18n/server";
import { getOffers } from "@/lib/offers";

export default async function OffersInboxPage() {
  const [dictionary, offers] = await Promise.all([getDictionary(), getOffers()]);
  const filtered = offers.filter((offer) => offer.status === "pricing" || offer.status === "draft");

  return (
    <AppShell>
      <OfferManagementView
        offers={filtered}
        savedFilters={{ status: "pricing", date: "14" }}
        title={dictionary.management.inboxTitle}
        description={dictionary.management.inboxDescription}
        emptyTitle={dictionary.management.inboxEmptyTitle}
        emptyDescription={dictionary.management.inboxEmptyDescription}
      />
    </AppShell>
  );
}
