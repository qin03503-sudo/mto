import { NextResponse } from "next/server";

import { getUnits } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: await getUnits() });
}
