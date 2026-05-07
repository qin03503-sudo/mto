import { NextResponse } from "next/server";

import { getOfferById } from "@/lib/offers";
import {
  getMaterialPricesForOffer,
  getMaterialPriceSummary,
} from "@/lib/material-prices";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: await getMaterialPricesForOffer(id),
    summary: await getMaterialPriceSummary(id),
  });
}
