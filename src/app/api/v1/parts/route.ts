import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scopeId = searchParams.get("scope_id") ?? undefined;

  let parts;
  if (scopeId) {
    parts = await prisma.part.findMany({
      where: { scopeId },
      include: { scope: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  } else {
    parts = await prisma.part.findMany({
      include: { scope: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  }
  return NextResponse.json({ data: parts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scopeId, name } = body;

    // Validate required fields
    if (!scopeId || !name) {
      return NextResponse.json(
        { error: "scopeId and name are required" },
        { status: 400 }
      );
    }

    // Check if the scope exists
    const scope = await prisma.scope.findUnique({ where: { id: scopeId } });
    if (!scope) {
      return NextResponse.json(
        { error: "Scope not found" },
        { status: 400 }
      );
    }

    // Check if a part with the same name already exists in this scope (optional, but good practice)
    const existing = await prisma.part.findFirst({
      where: { scopeId, name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A part with this name already exists in this scope" },
        { status: 400 }
      );
    }

    const part = await prisma.part.create({
      data: {
        id: `part-${randomUUID()}`,
        scopeId,
        name,
      },
    });

    return NextResponse.json({ data: part }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create part" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Part id is required as query parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { scopeId, name } = body;

    // Validate required fields
    if (!scopeId || !name) {
      return NextResponse.json(
        { error: "scopeId and name are required" },
        { status: 400 }
      );
    }

    // Check if the scope exists
    const scope = await prisma.scope.findUnique({ where: { id: scopeId } });
    if (!scope) {
      return NextResponse.json(
        { error: "Scope not found" },
        { status: 400 }
      );
    }

    // Check if another part with the same name exists in this scope (excluding current)
    const existing = await prisma.part.findFirst({
      where: {
        scopeId,
        name,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A part with this name already exists in this scope" },
        { status: 400 }
      );
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        scopeId,
        name,
      },
    });

    return NextResponse.json({ data: part });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update part" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Part id is required as query parameter" },
        { status: 400 }
      );
    }

    // Check if the part is used in any offer line parts
    const offerLinePartCount = await prisma.offerLinePart.count({
      where: { partId: id },
    });

    if (offerLinePartCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete part because it is used in offer line parts" },
        { status: 400 }
      );
    }

    // Check if the part is used in any MTO rows
    const mtoRowCount = await prisma.mtoRow.count({
      where: { partId: id },
    });

    if (mtoRowCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete part because it is used in MTO rows" },
        { status: 400 }
      );
    }

    await prisma.part.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete part" },
      { status: 500 }
    );
  }
}
