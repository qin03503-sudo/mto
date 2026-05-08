import type { Offer } from "./types";
import { defaultCurrency, normalizeCurrency, type PriceCurrency } from "@/lib/currency";

export type CreateOfferInput = {
  name: string;
  offerNumber: string;
  type: Offer["type"];
  inputDate: string;
  closeDate: string;
  description: string;
  currency: PriceCurrency;
};

export function buildCreatedOffer(input: CreateOfferInput): Offer {
  const slug = input.offerNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const id = slug.startsWith("off-") ? slug : `off-${slug}`;

  return {
    id,
    name: input.name,
    offerNumber: input.offerNumber,
    type: input.type,
    inputDate: input.inputDate,
    closeDate: input.closeDate,
    owner: "Estimator",
    status: "draft",
    calculationStatus: "not_calculated",
    description: input.description,
    currency: input.currency,
    scopes: 0,
    lines: 0,
    total: 0,
  };
}

export function createOfferInputFromFormData(formData: FormData): CreateOfferInput {
  const type = formData.get("type");

  return {
    name: String(formData.get("name") ?? ""),
    offerNumber: String(formData.get("offer_number") ?? ""),
    type: type === "custom" ? "custom" : "standard",
    inputDate: String(formData.get("input_date") ?? ""),
    closeDate: String(formData.get("close_date") ?? ""),
    description: String(formData.get("description") ?? ""),
    currency: normalizeCurrency(formData.get("currency") ?? defaultCurrency),
  };
}
