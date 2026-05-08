import { NextResponse } from "next/server";

import { calculateOffer } from "@/lib/calculation";
import { getOfferById, updateOffer } from "@/lib/offers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const run = await calculateOffer(id);

  await updateOffer(id,
    run.status === "current"
      ? { calculationStatus: run.status, total: run.total }
      : { calculationStatus: run.status }
  );

  return NextResponse.json(
    { data: run },
    { status: run.status === "failed" ? 422 : 200 }
  );
}
