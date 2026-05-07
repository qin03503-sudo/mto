import { NextResponse } from "next/server";

import { units } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: units });
}
