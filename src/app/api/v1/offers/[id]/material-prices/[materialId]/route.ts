import { NextResponse } from "next/server";

import { getOfferById, updateOffer } from "@/lib/offers";
import { updateProjectMaterialPrice } from "@/lib/material-prices";
import { isPriceCurrency } from "@/lib/currency";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const { id, materialId } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const body = (await request.json()) as { unit_price?: unknown; currency?: unknown };
  const unitPrice = Number(body.unit_price);

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return NextResponse.json(
      { error: "unit_price must be a non-negative number" },
      { status: 400 }
    );
  }

  if (!isPriceCurrency(body.currency)) {
    return NextResponse.json(
      { error: "currency must be USD, EUR, or IRR" },
      { status: 400 }
    );
  }

  const material = await updateProjectMaterialPrice(id, materialId, unitPrice, body.currency);

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  await updateOffer(id, { calculationStatus: "outdated" });

  return NextResponse.json({
    data: material,
    calculationStatus: "outdated",
  });
}
