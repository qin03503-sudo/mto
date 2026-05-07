import { NextResponse } from "next/server";

import { getOfferById } from "@/lib/offers";
import {
  addLineToOfferScope,
  addPartToLine,
  addScopeToOffer,
  getOfferScopes,
  getScopeLineSummary,
} from "@/lib/scopes-lines";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: await getOfferScopes(id),
    summary: await getScopeLineSummary(id),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    type?: unknown;
    scope_id?: unknown;
    offer_scope_id?: unknown;
    line_id?: unknown;
    line_name?: unknown;
    part_id?: unknown;
    qty?: unknown;
  };

  if (body.type === "scope") {
    const result = await addScopeToOffer(id, String(body.scope_id ?? ""));

    return result.error
      ? NextResponse.json({ error: result.error }, { status: 400 })
      : NextResponse.json({ data: result.data }, { status: 201 });
  }

  if (body.type === "line") {
    const result = await addLineToOfferScope(
      id,
      String(body.offer_scope_id ?? ""),
      String(body.line_name ?? "")
    );

    return result.error
      ? NextResponse.json({ error: result.error }, { status: 400 })
      : NextResponse.json({ data: result.data }, { status: 201 });
  }

  if (body.type === "part") {
    const result = await addPartToLine(
      id,
      String(body.offer_scope_id ?? ""),
      String(body.line_id ?? ""),
      String(body.part_id ?? ""),
      Number(body.qty)
    );

    return result.error
      ? NextResponse.json({ error: result.error }, { status: 400 })
      : NextResponse.json({ data: result.data }, { status: 201 });
  }

  return NextResponse.json(
    { error: "type must be scope, line, or part" },
    { status: 400 }
  );
}
