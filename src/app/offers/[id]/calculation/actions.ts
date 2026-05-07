"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateOffer } from "@/lib/calculation";
import { updateOffer } from "@/lib/offers";

export async function calculateOfferAction(offerId: string) {
  const run = await calculateOffer(offerId);

  await updateOffer(offerId, {
    calculationStatus: run.status,
    total: run.total,
  });

  revalidatePath(`/offers/${offerId}/calculation`);
  revalidatePath(`/offers/${offerId}/overview`);
  revalidatePath("/offers");
  redirect(`/offers/${offerId}/calculation`);
}
