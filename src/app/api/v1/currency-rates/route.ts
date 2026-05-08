import { NextResponse } from "next/server";

import { getExchangeRates } from "@/lib/exchange-rates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rates = await getExchangeRates(searchParams.get("base"));

  return NextResponse.json({ data: rates });
}
