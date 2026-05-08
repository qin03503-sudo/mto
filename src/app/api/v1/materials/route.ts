import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    include: { unit: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: materials });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dimension, unitId, defaultPrice } = body;

    // Validate required fields
    if (!name || !dimension || !unitId) {
      return NextResponse.json(
        { error: "name, dimension, and unitId are required" },
        { status: 400 }
      );
    }

    // Check if the unit exists
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: {
        id: `mat-${randomUUID()}`,
        name,
        dimension,
        unitId,
        defaultPrice: defaultPrice ?? null,
      },
    });

    return NextResponse.json({ data: material }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create material" },
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
        { error: "Material id is required as query parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, dimension, unitId, defaultPrice } = body;

    // Validate required fields
    if (!name || !dimension || !unitId) {
      return NextResponse.json(
        { error: "name, dimension, and unitId are required" },
        { status: 400 }
      );
    }

    // Check if the unit exists
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 400 }
      );
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        name,
        dimension,
        unitId,
        defaultPrice: defaultPrice ?? null,
      },
    });

    return NextResponse.json({ data: material });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update material" },
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
        { error: "Material id is required as query parameter" },
        { status: 400 }
      );
    }

    // Check if the material is used in any MTO rows
    const mtoRowCount = await prisma.mtoRow.count({
      where: { materialId: id },
    });

    if (mtoRowCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete material because it is used in MTO rows" },
        { status: 400 }
      );
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
