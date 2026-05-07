import { isOfferNumberTaken, type Offer } from "@/lib/offers";

export type CreateOfferInput = {
  name: string;
  offerNumber: string;
  type: Offer["type"];
  inputDate: string;
  closeDate: string;
  description: string;
};

export async function validateCreateOffer(input: CreateOfferInput) {
  const errors: string[] = [];

  if (!input.name.trim()) {
    errors.push("Offer name is required.");
  }

  if (!input.offerNumber.trim()) {
    errors.push("Offer number is required.");
  }

  if (input.offerNumber.trim() && await isOfferNumberTaken(input.offerNumber.trim())) {
    errors.push("Offer number must be unique.");
  }

  if (!input.inputDate) {
    errors.push("Input date is required.");
  }

  if (!input.closeDate) {
    errors.push("Close date is required.");
  }

  if (input.closeDate && input.inputDate && input.closeDate < input.inputDate) {
    errors.push("Close date cannot be earlier than input date.");
  }

  if (input.type !== "standard" && input.type !== "custom") {
    errors.push("Offer type must be standard or custom.");
  }

  return errors;
}

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
  };
}
