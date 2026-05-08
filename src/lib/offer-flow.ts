import { getCalculationResults } from "@/lib/calculation";
import { getMaterialPriceSummary } from "@/lib/material-prices";
import { getScopeLineSummary } from "@/lib/scopes-lines";

export const OFFER_FLOW_STEPS = [
  "overview",
  "material-prices",
  "scopes-lines",
  "calculation",
  "review-export",
] as const;

export type OfferFlowStep = (typeof OFFER_FLOW_STEPS)[number];

export async function getOfferFlowState(offerId: string) {
  const [materialSummary, scopeSummary, calculation] = await Promise.all([
    getMaterialPriceSummary(offerId),
    getScopeLineSummary(offerId),
    getCalculationResults(offerId),
  ]);

  const completed = {
    overview: true,
    "material-prices": materialSummary.unresolved === 0,
    "scopes-lines":
      scopeSummary.scopes > 0 &&
      scopeSummary.lines > 0 &&
      scopeSummary.parts > 0 &&
      scopeSummary.invalidQuantities === 0,
    calculation: calculation.issues.length === 0,
    "review-export":
      calculation.status === "current" && calculation.issues.length === 0,
  } satisfies Record<OfferFlowStep, boolean>;

  return { completed };
}
