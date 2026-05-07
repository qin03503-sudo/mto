import {
  getMaterialPriceSummary,
  getMaterialPricesForOffer,
} from "@/lib/material-prices";
import { getOfferById } from "@/lib/offers";
import { prisma } from "@/lib/prisma";
import {
  getOfferScopes,
  getMtoRowsForPart,
  getPartById,
  getScopeById,
  getScopeLineSummary,
} from "@/lib/scopes-lines";

export type CalculationIssue = {
  code: string;
  message: string;
};

export type CalculationMtoDetail = {
  mtoRowId: string;
  materialId: string;
  materialName: string;
  dimension: string;
  unit: string;
  value: number;
  unitPrice: number;
  total: number;
};

export type CalculationPartResult = {
  partId: string;
  partName: string;
  qty: number;
  unitPrice: number;
  total: number;
  details: CalculationMtoDetail[];
};

export type CalculationLineResult = {
  lineId: string;
  lineName: string;
  total: number;
  parts: CalculationPartResult[];
};

export type CalculationScopeResult = {
  scopeId: string;
  scopeName: string;
  total: number;
  lines: CalculationLineResult[];
};

export type CalculationRun = {
  id: string;
  offerId: string;
  mtoVersionId: string;
  runAt: string;
  status: "current" | "outdated" | "failed";
  total: number;
  issues: CalculationIssue[];
  scopes: CalculationScopeResult[];
};

export async function validateCalculationInputs(offerId: string) {
  const issues: CalculationIssue[] = [];
  const offer = await getOfferById(offerId);

  if (!offer) {
    return [{ code: "OFFER_NOT_FOUND", message: "Offer not found." }];
  }

  const offerScopes = await getOfferScopes(offerId);
  const scopeSummary = await getScopeLineSummary(offerId);
  const priceSummary = await getMaterialPriceSummary(offerId);

  if (offerScopes.length === 0) {
    issues.push({
      code: "NO_SCOPES",
      message: "Select at least one scope before calculation.",
    });
  }

  for (const offerScope of offerScopes) {
    const scope = getScopeById(offerScope.scopeId);

    if (offerScope.lines.length === 0) {
      issues.push({
        code: "SCOPE_HAS_NO_LINES",
        message: `${scope?.name ?? "Scope"} must have at least one line.`,
      });
    }

    for (const line of offerScope.lines) {
      if (!line.name.trim()) {
        issues.push({
          code: "LINE_NAME_REQUIRED",
          message: "Line name is required.",
        });
      }

      if (line.parts.length === 0) {
        issues.push({
          code: "LINE_HAS_NO_PARTS",
          message: `${line.name} must have at least one part.`,
        });
      }

      for (const linePart of line.parts) {
        const part = getPartById(linePart.partId);

        if (!part || part.scopeId !== offerScope.scopeId) {
          issues.push({
            code: "INVALID_SCOPE_PART",
            message: `${part?.name ?? "Part"} is not valid for ${scope?.name ?? "scope"}.`,
          });
        }

        if (part && getMtoRowsForPart(offerScope.scopeId, linePart.partId).length === 0) {
          issues.push({
            code: "MISSING_MTO_ROWS",
            message: `No MTO rows found for ${part.name} in ${scope?.name ?? "scope"}.`,
          });
        }

        if (linePart.qty <= 0) {
          issues.push({
            code: "INVALID_QTY",
            message: "Part quantity must be greater than zero.",
          });
        }
      }
    }
  }

  if (scopeSummary.invalidQuantities > 0) {
    issues.push({
      code: "INVALID_QUANTITIES",
      message: "One or more line parts have invalid quantities.",
    });
  }

  if (priceSummary.unresolved > 0) {
    issues.push({
      code: "UNRESOLVED_PRICES",
      message: "Resolve empty project material prices before calculation.",
    });
  }

  return issues;
}

async function buildCalculationRun(offerId: string): Promise<CalculationRun> {
  const issues = await validateCalculationInputs(offerId);
  const offerScopes = await getOfferScopes(offerId);
  const materialPricesById = new Map(
    (await getMaterialPricesForOffer(offerId)).map((price) => [price.materialId, price])
  );

  const scopeResults = offerScopes.map((offerScope) => {
    const scope = getScopeById(offerScope.scopeId);
    const lineResults = offerScope.lines.map((line) => {
      const partResults = line.parts.map((linePart) => {
        const part = getPartById(linePart.partId);
        const mtoRows = getMtoRowsForPart(offerScope.scopeId, linePart.partId);
        const details = mtoRows.map((row) => {
          const materialPrice = materialPricesById.get(row.materialId);
          const unitPrice = materialPrice?.projectPrice ?? 0;

          return {
            mtoRowId: row.id,
            materialId: row.materialId,
            materialName: materialPrice?.material ?? "Unknown material",
            dimension: materialPrice?.dimension ?? "",
            unit: materialPrice?.unit ?? "",
            value: row.value,
            unitPrice,
            total: row.value * unitPrice,
          };
        });
        const unitPrice = details.reduce((sum, row) => sum + row.total, 0);
        const total = unitPrice * linePart.qty;

        return {
          partId: linePart.partId,
          partName: part?.name ?? "Unknown part",
          qty: linePart.qty,
          unitPrice,
          total,
          details,
        };
      });
      const lineTotal = partResults.reduce((sum, part) => sum + part.total, 0);

      return {
        lineId: line.id,
        lineName: line.name,
        total: lineTotal,
        parts: partResults,
      };
    });
    const scopeTotal = lineResults.reduce((sum, line) => sum + line.total, 0);

    return {
      scopeId: offerScope.scopeId,
      scopeName: scope?.name ?? "Unknown scope",
      total: scopeTotal,
      lines: lineResults,
    };
  });
  const total = scopeResults.reduce((sum, scope) => sum + scope.total, 0);

  return {
    id: `run-${offerId}-${Date.now()}`,
    offerId,
    mtoVersionId: "mto-version-2026-05",
    runAt: new Date().toISOString(),
    status: issues.length > 0 ? "failed" : "current",
    total,
    issues,
    scopes: scopeResults,
  };
}

export async function calculateOffer(offerId: string): Promise<CalculationRun> {
  const run = await buildCalculationRun(offerId);

  await prisma.calculationRun.create({
    data: {
      id: run.id,
      offerId,
      mtoVersionId: run.mtoVersionId,
      runAt: run.runAt,
      status: run.status,
      total: run.total,
      payload: JSON.stringify(run),
    },
  });

  return run;
}

export async function getCalculationResults(offerId: string) {
  const lastRun = await prisma.calculationRun.findFirst({
    where: { offerId },
    orderBy: { runAt: "desc" },
  });
  const offer = await getOfferById(offerId);

  if (lastRun) {
    const parsed = JSON.parse(lastRun.payload) as CalculationRun;

    if (offer?.calculationStatus === "outdated") {
      return {
        ...parsed,
        status: "outdated" as const,
        issues: await validateCalculationInputs(offerId),
      };
    }

    return parsed;
  }

  return {
    ...(await buildCalculationRun(offerId)),
    id: `preview-${offerId}`,
    runAt: "Not calculated yet",
  };
}
