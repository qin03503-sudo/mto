import { NextResponse } from "next/server";

import { getOfferSummary, getOffers } from "@/lib/offers";
import { validateCreateOffer } from "@/lib/offer-validation";
import {
  buildCreatedOffer,
  type CreateOfferInput,
} from "@/lib/offer-utils";
import { initializeProjectMaterialPrices } from "@/lib/material-prices";
import { addOffer } from "@/lib/offers";

export async function GET() {
  const offers = await getOffers();

  return NextResponse.json({
    data: offers,
    summary: await getOfferSummary(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: unknown;
    offer_number?: unknown;
    type?: unknown;
    input_date?: unknown;
    close_date?: unknown;
    description?: unknown;
  };
  const input: CreateOfferInput = {
    name: typeof body.name === "string" ? body.name : "",
    offerNumber: typeof body.offer_number === "string" ? body.offer_number : "",
    type: body.type === "custom" ? "custom" : "standard",
    inputDate: typeof body.input_date === "string" ? body.input_date : "",
    closeDate: typeof body.close_date === "string" ? body.close_date : "",
    description: typeof body.description === "string" ? body.description : "",
  };
  const errors = await validateCreateOffer(input);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const offer = await addOffer(buildCreatedOffer(input));

  await initializeProjectMaterialPrices(offer.id);

  return NextResponse.json(
    {
      data: offer,
      sideEffects: ["project_material_prices_copied"],
    },
    { status: 201 }
  );
}
