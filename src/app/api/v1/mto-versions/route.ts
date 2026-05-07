import { NextResponse } from "next/server";

import { getMtoVersions } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: await getMtoVersions() });
}
