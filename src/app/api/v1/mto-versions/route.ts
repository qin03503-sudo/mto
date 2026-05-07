import { NextResponse } from "next/server";

import { mtoVersions } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: mtoVersions });
}
