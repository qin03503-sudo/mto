"use server";

import { revalidatePath } from "next/cache";

import { calculateOffer } from "@/lib/calculation";
import { updateOffer } from "@/lib/offers";

export async function recalculateOfferAction(offerId: string) {
  const run = await calculateOffer(offerId);

  await updateOffer(
    offerId,
    run.status === "current"
      ? { calculationStatus: run.status, total: run.total }
      : { calculationStatus: run.status }
  );

  revalidatePath(`/offers/${offerId}/review`);
  revalidatePath(`/offers/${offerId}/calculation`);
  revalidatePath(`/offers/${offerId}/overview`);
  revalidatePath("/offers");
}

export async function markOfferReadyAction(offerId: string) {
  await updateOffer(offerId, { status: "ready" });

  revalidatePath(`/offers/${offerId}/review`);
  revalidatePath(`/offers/${offerId}/overview`);
  revalidatePath("/offers");
}
