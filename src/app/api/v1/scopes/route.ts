import { NextResponse } from "next/server";

import { getScopes } from "@/lib/scopes-lines";

export async function GET() {
  return NextResponse.json({ data: await getScopes() });
}
