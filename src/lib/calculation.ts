import {
  getMaterialPricesForOffer,
} from "@/lib/material-prices";
import { getActiveMtoVersion } from "@/lib/master-data";
import { getOfferById } from "@/lib/offers";
import { prisma } from "@/lib/prisma";
import { defaultCurrency, normalizeCurrency, type PriceCurrency } from "@/lib/currency";
import { convertMoney } from "@/lib/exchange-rates";
import {
  getOfferScopes,
  getMtoRowsForPart,
  getPartById,
  getScopeById,
  getScopeLineSummary,
  getScopesByIds,
  getPartsByIds,
  getMtoRowsByPartIds,
} from "@/lib/scopes-lines";

export type CalculationIssue = {
  code: string;
  message: string;
};

const BLOCKING_ISSUE_CODES = new Set([
  "OFFER_NOT_FOUND",
  "NO_SCOPES",
  "SCOPE_HAS_NO_LINES",
  "LINE_HAS_NO_PARTS",
  "INVALID_SCOPE_PART",
  "MISSING_MTO_ROWS",
  "INVALID_QTY",
  "INVALID_QUANTITIES",
  "UNRESOLVED_PRICES",
]);

export type CalculationMtoDetail = {
  mtoRowId: string;
  materialId: string;
  materialName: string;
  dimension: string;
  unit: string;
  value: number;
  unitPrice: number;
  total: number;
  currency: PriceCurrency;
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
  currency: PriceCurrency;
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
  const materialPricesById = new Map(
    (await getMaterialPricesForOffer(offerId)).map((price) => [price.materialId, price])
  );
  const missingMaterialPriceIds = new Set<string>();

  if (offerScopes.length === 0) {
    issues.push({
      code: "NO_SCOPES",
      message: "Select at least one scope before calculation.",
    });
  }

  const scopeIds = Array.from(new Set(offerScopes.map((os) => os.scopeId)));
  const partIds = Array.from(
    new Set(offerScopes.flatMap((os) => os.lines.flatMap((l) => l.parts.map((p) => p.partId))))
  );

  const [scopes, parts, allMtoRows] = await Promise.all([
    getScopesByIds(scopeIds),
    getPartsByIds(partIds),
    getMtoRowsByPartIds(partIds),
  ]);

  const scopesById = new Map(scopes.map((s) => [s.id, s]));
  const partsById = new Map(parts.map((p) => [p.id, p]));
  const mtoRowsByPartId = new Map<string, typeof allMtoRows>();

  for (const row of allMtoRows) {
    const rows = mtoRowsByPartId.get(row.partId) ?? [];
    rows.push(row);
    mtoRowsByPartId.set(row.partId, rows);
  }

  for (const offerScope of offerScopes) {
    const scope = scopesById.get(offerScope.scopeId);

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
        const part = partsById.get(linePart.partId);

        if (!part || part.scopeId !== offerScope.scopeId) {
          issues.push({
            code: "INVALID_SCOPE_PART",
            message: `${part?.name ?? "Part"} is not valid for ${scope?.name ?? "scope"}.`,
          });
        }

        const mtoRows = part ? (mtoRowsByPartId.get(linePart.partId) ?? []) : [];

        if (part && mtoRows.length === 0) {
          issues.push({
            code: "MISSING_MTO_ROWS",
            message: `No MTO rows found for ${part.name} in ${scope?.name ?? "scope"}.`,
          });
        }

        for (const row of mtoRows) {
          const price = materialPricesById.get(row.materialId);

          if (!price || price.projectPrice === null) {
            missingMaterialPriceIds.add(row.materialId);
          }
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

  if (missingMaterialPriceIds.size > 0) {
    issues.push({
      code: "UNRESOLVED_PRICES",
      message: "Resolve empty project material prices required by selected MTO rows before calculation.",
    });
  }

  return issues;
}

function splitBlockingIssues(issues: CalculationIssue[]) {
  return issues.reduce(
    (acc, issue) => {
      if (BLOCKING_ISSUE_CODES.has(issue.code)) {
        acc.blocking.push(issue);
      } else {
        acc.nonBlocking.push(issue);
      }

      return acc;
    },
    { blocking: [] as CalculationIssue[], nonBlocking: [] as CalculationIssue[] }
  );
}

async function buildCalculationRun(offerId: string): Promise<CalculationRun> {
  const issues = await validateCalculationInputs(offerId);
  const { blocking: blockingIssues } = splitBlockingIssues(issues);
  const offer = await getOfferById(offerId);
  const currency = normalizeCurrency(offer?.currency ?? defaultCurrency);
  const activeVersion = await getActiveMtoVersion();

  if (blockingIssues.length > 0) {
    return {
      id: `run-${offerId}-${Date.now()}`,
      offerId,
      mtoVersionId: activeVersion?.id ?? "no-approved-mto-version",
      runAt: new Date().toISOString(),
      status: "failed",
      total: 0,
      currency,
      issues,
      scopes: [],
    };
  }

  const offerScopes = await getOfferScopes(offerId);
  const materialPricesById = new Map(
    (await getMaterialPricesForOffer(offerId)).map((price) => [price.materialId, price])
  );
  const scopeResults: CalculationScopeResult[] = [];

  const scopeIds = Array.from(new Set(offerScopes.map((os) => os.scopeId)));
  const partIds = Array.from(
    new Set(offerScopes.flatMap((os) => os.lines.flatMap((l) => l.parts.map((p) => p.partId))))
  );

  const [scopes, parts, allMtoRows] = await Promise.all([
    getScopesByIds(scopeIds),
    getPartsByIds(partIds),
    getMtoRowsByPartIds(partIds),
  ]);

  const scopesById = new Map(scopes.map((s) => [s.id, s]));
  const partsById = new Map(parts.map((p) => [p.id, p]));
  const mtoRowsByPartId = new Map<string, typeof allMtoRows>();

  for (const row of allMtoRows) {
    const rows = mtoRowsByPartId.get(row.partId) ?? [];
    rows.push(row);
    mtoRowsByPartId.set(row.partId, rows);
  }

  for (const offerScope of offerScopes) {
    const scope = scopesById.get(offerScope.scopeId);
    const lineResults: CalculationLineResult[] = [];

    for (const line of offerScope.lines) {
      const partResults: CalculationPartResult[] = [];

      for (const linePart of line.parts) {
        const part = partsById.get(linePart.partId);
        const mtoRows = mtoRowsByPartId.get(linePart.partId) ?? [];
        const details = await Promise.all(mtoRows.map(async (row) => {
          const materialPrice = materialPricesById.get(row.materialId);
          if (!materialPrice || materialPrice.projectPrice === null) {
            throw new Error(`Missing required material price for mtoRowId=${row.id}`);
          }
          const unitPrice = await convertMoney(
            materialPrice.projectPrice,
            materialPrice.projectCurrency,
            currency
          );

          return {
            mtoRowId: row.id,
            materialId: row.materialId,
            materialName: materialPrice.material ?? "Unknown material",
            dimension: materialPrice.dimension ?? "",
            unit: materialPrice.unit ?? "",
            value: row.value,
            unitPrice,
            total: row.value * unitPrice,
            currency,
          };
        }));
        const unitPrice = details.reduce((sum, row) => sum + row.total, 0);
        const total = unitPrice * linePart.qty;

        partResults.push({
          partId: linePart.partId,
          partName: part?.name ?? "Unknown part",
          qty: linePart.qty,
          unitPrice,
          total,
          details,
        });
      }

      const lineTotal = partResults.reduce((sum, part) => sum + part.total, 0);

      lineResults.push({
        lineId: line.id,
        lineName: line.name,
        total: lineTotal,
        parts: partResults,
      });
    }

    const scopeTotal = lineResults.reduce((sum, line) => sum + line.total, 0);

    scopeResults.push({
      scopeId: offerScope.scopeId,
      scopeName: scope?.name ?? "Unknown scope",
      total: scopeTotal,
      lines: lineResults,
    });
  }

  const total = scopeResults.reduce((sum, scope) => sum + scope.total, 0);

  return {
    id: `run-${offerId}-${Date.now()}`,
    offerId,
    mtoVersionId: activeVersion?.id ?? "no-approved-mto-version",
    runAt: new Date().toISOString(),
    status: issues.length > 0 ? "failed" : "current",
    total,
    currency,
    issues,
    scopes: scopeResults,
  };
}

export async function calculateOffer(offerId: string): Promise<CalculationRun> {
  const run = await buildCalculationRun(offerId);
  const persistedTotal = run.status === "failed" ? 0 : run.total;

  await prisma.calculationRun.create({
    data: {
      id: run.id,
      offerId,
      mtoVersionId: run.mtoVersionId,
      runAt: run.runAt,
      status: run.status,
      total: persistedTotal,
      currency: run.currency,
      payload: JSON.stringify({
        ...run,
        total: persistedTotal,
        scopes: run.status === "failed" ? [] : run.scopes,
      } satisfies CalculationRun),
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
