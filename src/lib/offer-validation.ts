import { isOfferNumberTaken } from "@/lib/offers";
import type { CreateOfferInput } from "./offer-utils";

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
