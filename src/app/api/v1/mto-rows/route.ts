import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const mtoRows = await prisma.mtoRow.findMany({
    include: {
      scope: { select: { id: true, name: true } },
      part: { select: { id: true, name: true } },
      material: { select: { id: true, name: true } },
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ data: mtoRows });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scopeId, partId, materialId, description, quantity, value, unit } = body;

    // Validate required fields
    if (!scopeId || !partId || !materialId || value === undefined) {
      return NextResponse.json(
        { error: "scopeId, partId, materialId, and value are required" },
        { status: 400 }
      );
    }

    // Check if the related entities exist
    const [scope, part, material] = await Promise.all([
      prisma.scope.findUnique({ where: { id: scopeId } }),
      prisma.part.findUnique({ where: { id: partId } }),
      prisma.material.findUnique({ where: { id: materialId } }),
    ]);

    if (!scope || !part || !material) {
      return NextResponse.json(
        { error: "Related scope, part, or material not found" },
        { status: 400 }
      );
    }

    const mtoRow = await prisma.mtoRow.create({
      data: {
        id: `mto-${randomUUID()}`,
        scopeId,
        partId,
        materialId,
        description: description ?? "",
        quantity: quantity ?? 1,
        value,
        unit: unit ?? "",
      },
    });

    return NextResponse.json({ data: mtoRow }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create MTO row" },
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
        { error: "MTO row id is required as query parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { scopeId, partId, materialId, description, quantity, value, unit } = body;

    // Validate required fields
    if (!scopeId || !partId || !materialId || value === undefined) {
      return NextResponse.json(
        { error: "scopeId, partId, materialId, and value are required" },
        { status: 400 }
      );
    }

    // Check if the related entities exist
    const [scope, part, material] = await Promise.all([
      prisma.scope.findUnique({ where: { id: scopeId } }),
      prisma.part.findUnique({ where: { id: partId } }),
      prisma.material.findUnique({ where: { id: materialId } }),
    ]);

    if (!scope || !part || !material) {
      return NextResponse.json(
        { error: "Related scope, part, or material not found" },
        { status: 400 }
      );
    }

    const mtoRow = await prisma.mtoRow.update({
      where: { id },
      data: {
        scopeId,
        partId,
        materialId,
        description: description ?? "",
        quantity: quantity ?? 1,
        value,
        unit: unit ?? "",
      },
    });

    return NextResponse.json({ data: mtoRow });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update MTO row" },
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
        { error: "MTO row id is required as query parameter" },
        { status: 400 }
      );
    }

    await prisma.mtoRow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete MTO row" },
      { status: 500 }
    );
  }
}
