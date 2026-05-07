import { NextResponse } from "next/server";

import { getMaterials } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: await getMaterials() });
}
