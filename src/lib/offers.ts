import { prisma } from "@/lib/prisma";

export type OfferStatus =
  | "draft"
  | "pricing"
  | "ready"
  | "sent"
  | "closed"
  | "cancelled";

export type CalculationStatus =
  | "not_calculated"
  | "current"
  | "outdated"
  | "failed";

export type Offer = {
  id: string;
  name: string;
  offerNumber: string;
  type: "standard" | "custom";
  inputDate: string;
  closeDate: string;
  owner: string;
  status: OfferStatus;
  calculationStatus: CalculationStatus;
  description: string;
  scopes: number;
  lines: number;
  total: number;
};

export const seedOffers: Offer[] = [
  {
    id: "off-2026-001",
    name: "Metro Line Busduct Package",
    offerNumber: "OFF-2026-001",
    type: "standard",
    inputDate: "2026-05-07",
    closeDate: "2026-05-20",
    owner: "Estimator",
    status: "pricing",
    calculationStatus: "outdated",
    description: "Busduct package for the metro line expansion tender.",
    scopes: 2,
    lines: 2,
    total: 428500,
  },
  {
    id: "off-2026-002",
    name: "Hospital Tower Expansion",
    offerNumber: "OFF-2026-002",
    type: "custom",
    inputDate: "2026-05-04",
    closeDate: "2026-05-18",
    owner: "Sales",
    status: "pricing",
    calculationStatus: "not_calculated",
    description: "Custom package requiring hospital tower material overrides.",
    scopes: 1,
    lines: 1,
    total: 184200,
  },
  {
    id: "off-2026-003",
    name: "Airport Service Building",
    offerNumber: "OFF-2026-003",
    type: "standard",
    inputDate: "2026-04-29",
    closeDate: "2026-05-15",
    owner: "Manager",
    status: "ready",
    calculationStatus: "current",
    description: "Ready customer output for airport service building review.",
    scopes: 0,
    lines: 0,
    total: 612900,
  },
];

function toOffer(offer: {
  id: string;
  name: string;
  offerNumber: string;
  type: string;
  inputDate: string;
  closeDate: string;
  owner: string;
  status: string;
  calculationStatus: string;
  description: string;
  scopes: number;
  lines: number;
  total: number;
}): Offer {
  return {
    ...offer,
    type: offer.type === "custom" ? "custom" : "standard",
    status: offer.status as OfferStatus,
    calculationStatus: offer.calculationStatus as CalculationStatus,
  };
}

export async function getOffers() {
  const rows = await prisma.offer.findMany({
    orderBy: [{ inputDate: "desc" }, { offerNumber: "desc" }],
  });

  return rows.map(toOffer);
}

export async function addOffer(offer: Offer) {
  const created = await prisma.offer.create({ data: offer });

  return toOffer(created);
}

export async function updateOffer(
  offerId: string,
  updates: Partial<Pick<Offer, "calculationStatus" | "lines" | "scopes" | "total">>
) {
  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: updates,
  });

  return toOffer(updated);
}

export async function getOfferSummary() {
  const offers = await getOffers();

  return {
    activeOffers: offers.length,
    openValue: offers.reduce((sum, offer) => sum + offer.total, 0),
    outdatedCalculations: offers.filter(
      (offer) => offer.calculationStatus === "outdated"
    ).length,
    linesConfigured: offers.reduce((sum, offer) => sum + offer.lines, 0),
  };
}

export async function getOfferById(id: string) {
  const offer = await prisma.offer.findUnique({ where: { id } });

  return offer ? toOffer(offer) : undefined;
}

export async function isOfferNumberTaken(offerNumber: string) {
  const existing = await prisma.offer.findFirst({
    where: { offerNumber: { equals: offerNumber } },
    select: { id: true, offerNumber: true },
  });

  return Boolean(existing);
}
