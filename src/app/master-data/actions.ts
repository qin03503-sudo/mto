"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaterial(data: { id: string; name: string; dimension: string; unitId: string; defaultPrice: number | null }) {
  await prisma.material.create({ data });
  revalidatePath("/master-data/materials");
}

export async function updateMaterial(id: string, data: { name: string; dimension: string; unitId: string; defaultPrice: number | null }) {
  await prisma.material.update({ where: { id }, data });
  revalidatePath("/master-data/materials");
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({ where: { id } });
  revalidatePath("/master-data/materials");
}

export async function createScope(data: { id: string; name: string; description: string }) {
  await prisma.scope.create({ data });
  revalidatePath("/master-data/scopes");
}

export async function updateScope(id: string, data: { name: string; description: string }) {
  await prisma.scope.update({ where: { id }, data });
  revalidatePath("/master-data/scopes");
}

export async function deleteScope(id: string) {
  await prisma.scope.delete({ where: { id } });
  revalidatePath("/master-data/scopes");
}

export async function createPart(data: { id: string; name: string; scopeId: string }) {
  await prisma.part.create({ data });
  revalidatePath("/master-data/parts");
}

export async function updatePart(id: string, data: { name: string; scopeId: string }) {
  await prisma.part.update({ where: { id }, data });
  revalidatePath("/master-data/parts");
}

export async function deletePart(id: string) {
  await prisma.part.delete({ where: { id } });
  revalidatePath("/master-data/parts");
}

export async function createMtoRow(data: { id: string; scopeId: string; partId: string; materialId: string; description: string; quantity: number; value: number; unit: string }) {
  await prisma.mtoRow.create({ data });
  revalidatePath("/master-data/mto-rows");
}

export async function updateMtoRow(id: string, data: { scopeId: string; partId: string; materialId: string; description: string; quantity: number; value: number; unit: string }) {
  await prisma.mtoRow.update({ where: { id }, data });
  revalidatePath("/master-data/mto-rows");
}

export async function deleteMtoRow(id: string) {
  await prisma.mtoRow.delete({ where: { id } });
  revalidatePath("/master-data/mto-rows");
}
