import { NextResponse } from "next/server";

import { materials } from "@/lib/master-data";

export async function GET() {
  return NextResponse.json({ data: materials });
}
