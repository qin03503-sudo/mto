import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/i18n/server";
import { getOffers } from "@/lib/offers";

export default async function DashboardPage() {
  const [dictionary, offers] = await Promise.all([getDictionary(), getOffers()]);
  const statusData = Object.entries(offers.reduce<Record<string, number>>((acc, offer) => {
    acc[offer.status] = (acc[offer.status] ?? 0) + 1;
    return acc;
  }, {}));

  const topOffers = [...offers].sort((a, b) => b.total - a.total).slice(0, 8);
  const maxTotal = topOffers[0]?.total ?? 1;

  return (
    <AppShell>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{dictionary.dashboard.offersByStatus}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {statusData.map(([status, count]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{status}</span><span>{count}</span></div>
                <div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(count / Math.max(offers.length, 1)) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{dictionary.dashboard.topOfferValues}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topOffers.map((offer) => (
              <div key={offer.id} className="space-y-1">
                <div className="flex justify-between gap-4 text-sm"><span className="truncate">{offer.name}</span><span>{offer.total.toLocaleString()} {offer.currency}</span></div>
                <div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-chart-2" style={{ width: `${(offer.total / maxTotal) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
