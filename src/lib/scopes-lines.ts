import { getMaterialPricesForOffer } from "@/lib/material-prices";
import { updateOffer } from "@/lib/offers";
import { prisma } from "@/lib/prisma";

export type Scope = {
  id: string;
  name: string;
  description: string;
};

export type Part = {
  id: string;
  scopeId: string;
  name: string;
};

export type MtoRow = {
  id: string;
  scopeId: string;
  partId: string;
  materialId: string;
  description: string;
  value: number;
};

export type OfferLinePart = {
  id: string;
  partId: string;
  qty: number;
};

export type OfferLine = {
  id: string;
  name: string;
  parts: OfferLinePart[];
};

export type OfferScope = {
  id: string;
  scopeId: string;
  lines: OfferLine[];
};

export const scopes: Scope[] = [
  {
    id: "scope-1000a-al",
    name: "1000A AL",
    description: "Aluminum busduct scope for 1000A feeders.",
  },
  {
    id: "scope-1600a-al",
    name: "1600A AL",
    description: "Aluminum busduct scope for 1600A feeders.",
  },
  {
    id: "scope-2500a-cu",
    name: "2500A CU",
    description: "Copper busduct scope for high-current lines.",
  },
];

export const parts: Part[] = [
  {
    id: "part-feeder-1000",
    scopeId: "scope-1000a-al",
    name: "FEEDER-1000",
  },
  {
    id: "part-top-off-box-250",
    scopeId: "scope-1000a-al",
    name: "TOP OFF BOX 250",
  },
  {
    id: "part-elbow-1000",
    scopeId: "scope-1000a-al",
    name: "ELBOW-1000",
  },
  {
    id: "part-feeder-1600",
    scopeId: "scope-1600a-al",
    name: "FEEDER-1600",
  },
  {
    id: "part-plug-in-1600",
    scopeId: "scope-1600a-al",
    name: "PLUG IN BOX 1600",
  },
  {
    id: "part-feeder-2500-cu",
    scopeId: "scope-2500a-cu",
    name: "FEEDER-2500 CU",
  },
];

export const mtoRows: MtoRow[] = [
  {
    id: "mto-feeder-1000-al-profile",
    scopeId: "scope-1000a-al",
    partId: "part-feeder-1000",
    materialId: "mat-al-profile",
    description: "Aluminum profile body",
    value: 668916.6986,
  },
  {
    id: "mto-feeder-1000-bolts",
    scopeId: "scope-1000a-al",
    partId: "part-feeder-1000",
    materialId: "mat-bolt-6x20",
    description: "Connection bolts",
    value: 12,
  },
  {
    id: "mto-top-off-al-profile",
    scopeId: "scope-1000a-al",
    partId: "part-top-off-box-250",
    materialId: "mat-al-profile",
    description: "Tap-off enclosure profile",
    value: 183600,
  },
  {
    id: "mto-elbow-al-profile",
    scopeId: "scope-1000a-al",
    partId: "part-elbow-1000",
    materialId: "mat-al-profile",
    description: "Elbow aluminum profile",
    value: 123333.3333,
  },
  {
    id: "mto-feeder-1600-al-profile",
    scopeId: "scope-1600a-al",
    partId: "part-feeder-1600",
    materialId: "mat-al-profile",
    description: "1600A aluminum body",
    value: 995833.3333,
  },
  {
    id: "mto-plug-in-1600-insulator",
    scopeId: "scope-1600a-al",
    partId: "part-plug-in-1600",
    materialId: "mat-insulator",
    description: "Plug-in support insulators",
    value: 1305084.7458,
  },
  {
    id: "mto-feeder-2500-cu-copper",
    scopeId: "scope-2500a-cu",
    partId: "part-feeder-2500-cu",
    materialId: "mat-copper-bar",
    description: "Copper conductor bars",
    value: 408888.8889,
  },
];

export const seedOfferScopes: Record<string, OfferScope[]> = {
  "off-2026-001": [
    {
      id: "offer-scope-001-1000a",
      scopeId: "scope-1000a-al",
      lines: [
        {
          id: "line-001-main-riser",
          name: "Main riser",
          parts: [
            {
              id: "line-part-001-feeder",
              partId: "part-feeder-1000",
              qty: 1,
            },
            {
              id: "line-part-001-top-off",
              partId: "part-top-off-box-250",
              qty: 2,
            },
          ],
        },
      ],
    },
    {
      id: "offer-scope-001-1600a",
      scopeId: "scope-1600a-al",
      lines: [
        {
          id: "line-001-plant-room",
          name: "Plant room feeder",
          parts: [
            {
              id: "line-part-001-feeder-1600",
              partId: "part-feeder-1600",
              qty: 1,
            },
          ],
        },
      ],
    },
  ],
  "off-2026-002": [
    {
      id: "offer-scope-002-1000a",
      scopeId: "scope-1000a-al",
      lines: [
        {
          id: "line-002-east-wing",
          name: "East wing",
          parts: [
            {
              id: "line-part-002-elbow",
              partId: "part-elbow-1000",
              qty: 4,
            },
          ],
        },
      ],
    },
  ],
};

function toOfferScope(scope: {
  id: string;
  scopeId: string;
  lines: {
    id: string;
    name: string;
    parts: { id: string; partId: string; qty: number }[];
  }[];
}): OfferScope {
  return {
    id: scope.id,
    scopeId: scope.scopeId,
    lines: scope.lines.map((line) => ({
      id: line.id,
      name: line.name,
      parts: line.parts.map((part) => ({
        id: part.id,
        partId: part.partId,
        qty: part.qty,
      })),
    })),
  };
}

async function syncOfferScopeLineCounts(offerId: string) {
  const summary = await getScopeLineSummary(offerId);

  await updateOffer(offerId, {
    calculationStatus: "outdated",
    lines: summary.lines,
    scopes: summary.scopes,
  });
}

export function getPartsForScope(scopeId?: string) {
  if (!scopeId) {
    return parts;
  }

  return parts.filter((part) => part.scopeId === scopeId);
}

export async function getOfferScopes(offerId: string) {
  const offerScopes = await prisma.offerScope.findMany({
    where: { offerId },
    include: {
      lines: {
        include: { parts: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return offerScopes.map(toOfferScope);
}

export async function addScopeToOffer(offerId: string, scopeId: string) {
  const scope = getScopeById(scopeId);

  if (!scope) {
    return { error: "Scope not found." };
  }

  const selectedScopes = await getOfferScopes(offerId);

  if (selectedScopes.some((offerScope) => offerScope.scopeId === scopeId)) {
    return { error: `${scope.name} is already selected.` };
  }

  const created = await prisma.offerScope.create({
    data: {
      id: `offer-scope-${offerId}-${scopeId}`,
      offerId,
      scopeId,
    },
    include: { lines: { include: { parts: true } } },
  });
  await syncOfferScopeLineCounts(offerId);

  return { data: toOfferScope(created) };
}

export async function addLineToOfferScope(
  offerId: string,
  offerScopeId: string,
  lineName: string
) {
  const offerScope = await prisma.offerScope.findFirst({
    where: { id: offerScopeId, offerId },
  });
  const normalizedLineName = lineName.trim();

  if (!offerScope) {
    return { error: "Offer scope not found." };
  }

  if (!normalizedLineName) {
    return { error: "Line name is required." };
  }

  const line = await prisma.offerLine.create({
    data: {
      id: `line-${offerScopeId}-${Date.now()}`,
      offerScopeId,
      name: normalizedLineName,
    },
  });
  await syncOfferScopeLineCounts(offerId);

  return { data: { id: line.id, name: line.name, parts: [] } };
}

export async function addPartToLine(
  offerId: string,
  offerScopeId: string,
  lineId: string,
  partId: string,
  qty: number
) {
  const offerScope = await prisma.offerScope.findFirst({
    where: { id: offerScopeId, offerId },
    include: { lines: true },
  });
  const line = offerScope?.lines.find((candidate) => candidate.id === lineId);
  const part = getPartById(partId);

  if (!offerScope || !line) {
    return { error: "Line not found." };
  }

  if (!part || part.scopeId !== offerScope.scopeId) {
    return { error: "Part is not valid for this scope." };
  }

  if (!Number.isFinite(qty) || qty <= 0) {
    return { error: "Quantity must be greater than zero." };
  }

  const linePart = await prisma.offerLinePart.create({
    data: {
      id: `line-part-${lineId}-${partId}-${Date.now()}`,
      lineId,
      partId,
      qty,
    },
  });
  await syncOfferScopeLineCounts(offerId);

  return { data: { id: linePart.id, partId: linePart.partId, qty: linePart.qty } };
}

export function getScopeById(scopeId: string) {
  return scopes.find((scope) => scope.id === scopeId);
}

export function getPartById(partId: string) {
  return parts.find((part) => part.id === partId);
}

export function getMtoRowsForPart(scopeId: string, partId: string) {
  return mtoRows.filter(
    (row) => row.scopeId === scopeId && row.partId === partId
  );
}

export async function getPartUnitPrice(
  offerId: string,
  scopeId: string,
  partId: string
) {
  const materialPricesById = new Map(
    (await getMaterialPricesForOffer(offerId)).map((price) => [price.materialId, price])
  );

  return getMtoRowsForPart(scopeId, partId).reduce((sum, row) => {
    const materialPrice = materialPricesById.get(row.materialId);

    return sum + row.value * (materialPrice?.projectPrice ?? 0);
  }, 0);
}

export async function getScopeLineSummary(offerId: string) {
  const selectedScopes = await getOfferScopes(offerId);
  const lines = selectedScopes.flatMap((scope) => scope.lines);
  const lineParts = lines.flatMap((line) => line.parts);

  return {
    scopes: selectedScopes.length,
    lines: lines.length,
    parts: lineParts.length,
    invalidQuantities: lineParts.filter((part) => part.qty <= 0).length,
  };
}
