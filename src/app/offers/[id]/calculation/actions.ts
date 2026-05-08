"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateOffer } from "@/lib/calculation";
import { updateOffer } from "@/lib/offers";

export async function calculateOfferAction(offerId: string) {
  const run = await calculateOffer(offerId);

  await updateOffer(offerId,
    run.status === "current"
      ? { calculationStatus: run.status, total: run.total }
      : { calculationStatus: run.status }
  );

  revalidatePath(`/offers/${offerId}/calculation`);
  revalidatePath(`/offers/${offerId}/overview`);
  revalidatePath("/offers");
  redirect(`/offers/${offerId}/calculation`);
}
