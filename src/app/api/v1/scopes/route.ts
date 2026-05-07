import { NextResponse } from "next/server";

import { scopes } from "@/lib/scopes-lines";

export async function GET() {
  return NextResponse.json({ data: scopes });
}
