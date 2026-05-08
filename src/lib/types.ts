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
