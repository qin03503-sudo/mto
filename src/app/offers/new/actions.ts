"use server";

import { redirect } from "next/navigation";

import {
  buildCreatedOffer,
  createOfferInputFromFormData,
  validateCreateOffer,
} from "@/lib/offer-validation";
import { initializeProjectMaterialPrices } from "@/lib/material-prices";
import { addOffer } from "@/lib/offers";

export async function createOfferAction(formData: FormData) {
  const input = createOfferInputFromFormData(formData);
  const errors = await validateCreateOffer(input);

  if (errors.length > 0) {
    redirect(`/offers/new?error=${encodeURIComponent(errors[0])}`);
  }

  const offer = await addOffer(buildCreatedOffer(input));

  await initializeProjectMaterialPrices(offer.id);

  redirect(`/offers/${offer.id}/overview?created=1`);
}
