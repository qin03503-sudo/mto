import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const scopes = await prisma.scope.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: scopes });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if scope with same name already exists
    const existing = await prisma.scope.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A scope with this name already exists" },
        { status: 400 }
      );
    }

    const scope = await prisma.scope.create({
      data: {
        id: `scope-${randomUUID()}`,
        name,
        description: description ?? "",
      },
    });

    return NextResponse.json({ data: scope }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create scope" },
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
        { error: "Scope id is required as query parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if scope with same name exists (excluding current)
    const existing = await prisma.scope.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A scope with this name already exists" },
        { status: 400 }
      );
    }

    const scope = await prisma.scope.update({
      where: { id },
      data: {
        name,
        description: description ?? "",
      },
    });

    return NextResponse.json({ data: scope });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update scope" },
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
        { error: "Scope id is required as query parameter" },
        { status: 400 }
      );
    }

    // Check if the scope is used in any parts
    const partCount = await prisma.part.count({
      where: { scopeId: id },
    });

    if (partCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete scope because it is used in parts" },
        { status: 400 }
      );
    }

    // Check if the scope is used in any offer scopes
    const offerScopeCount = await prisma.offerScope.count({
      where: { scopeId: id },
    });

    if (offerScopeCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete scope because it is used in offers" },
        { status: 400 }
      );
    }

    // Check if the scope is used in any MTO rows
    const mtoRowCount = await prisma.mtoRow.count({
      where: { scopeId: id },
    });

    if (mtoRowCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete scope because it is used in MTO rows" },
        { status: 400 }
      );
    }

    await prisma.scope.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete scope" },
      { status: 500 }
    );
  }
}
