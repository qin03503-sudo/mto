import { getMaterialPricesForOffer } from "@/lib/material-prices";
import { getOfferById } from "@/lib/offers";
import { prisma } from "@/lib/prisma";
import { convertMoney } from "@/lib/exchange-rates";
import { defaultCurrency, normalizeCurrency } from "@/lib/currency";

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
  quantity: number;
  value: number;
  unit: string;
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

export async function getScopes(): Promise<Scope[]> {
  return prisma.scope.findMany({ orderBy: { name: "asc" } });
}

export async function getPartsForScope(scopeId?: string): Promise<Part[]> {
  return prisma.part.findMany({
    where: scopeId ? { scopeId } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getMtoRows(): Promise<MtoRow[]> {
  return prisma.mtoRow.findMany({ orderBy: { id: "asc" } });
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
  const scope = await getScopeById(scopeId);

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
  const part = await getPartById(partId);

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

export async function getScopeById(scopeId: string) {
  return prisma.scope.findUnique({ where: { id: scopeId } });
}

export async function getScopesByIds(scopeIds: string[]) {
  return prisma.scope.findMany({
    where: { id: { in: scopeIds } },
  });
}

export async function getPartById(partId: string) {
  return prisma.part.findUnique({ where: { id: partId } });
}

export async function getPartsByIds(partIds: string[]) {
  return prisma.part.findMany({
    where: { id: { in: partIds } },
  });
}

export async function getMtoRowsForPart(scopeId: string, partId: string) {
  return prisma.mtoRow.findMany({
    where: { scopeId, partId },
    orderBy: { id: "asc" },
  });
}

export async function getMtoRowsByPartIds(partIds: string[]) {
  return prisma.mtoRow.findMany({
    where: { partId: { in: partIds } },
    orderBy: { id: "asc" },
  });
}

export async function getPartUnitPrice(
  offerId: string,
  scopeId: string,
  partId: string
) {
  const offer = await getOfferById(offerId);
  const currency = normalizeCurrency(offer?.currency ?? defaultCurrency);
  const materialPricesById = new Map(
    (await getMaterialPricesForOffer(offerId)).map((price) => [price.materialId, price])
  );
  const rows = await getMtoRowsForPart(scopeId, partId);
  let total = 0;

  for (const row of rows) {
    const materialPrice = materialPricesById.get(row.materialId);
    const unitPrice = await convertMoney(
      materialPrice?.projectPrice ?? 0,
      materialPrice?.projectCurrency ?? currency,
      currency
    );

    total += row.value * unitPrice;
  }

  return total;
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
