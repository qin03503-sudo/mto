import { NextResponse } from "next/server";

import { getPartsForScope } from "@/lib/scopes-lines";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scopeId = searchParams.get("scope_id") ?? undefined;

  return NextResponse.json({ data: getPartsForScope(scopeId) });
}
