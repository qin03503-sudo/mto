import { prisma } from "@/lib/prisma";

export type Unit = {
  id: string;
  name: string;
  symbol: string;
};

export type Material = {
  id: string;
  name: string;
  dimension: string;
  unitId: string;
  defaultPrice: number | null;
  defaultCurrency: string;
};

export type MtoVersion = {
  id: string;
  version: string;
  importedAt: string;
  status: "draft" | "approved" | "archived";
};

function toMtoVersion(version: {
  id: string;
  version: string;
  importedAt: string;
  status: string;
}): MtoVersion {
  return {
    ...version,
    status: version.status as MtoVersion["status"],
  };
}

export async function getUnits(): Promise<Unit[]> {
  return prisma.unit.findMany({ orderBy: { name: "asc" } });
}

export async function getMaterials(): Promise<Material[]> {
  return prisma.material.findMany({ orderBy: { name: "asc" } });
}

export async function getMtoVersions(): Promise<MtoVersion[]> {
  const versions = await prisma.mtoVersion.findMany({
    orderBy: { importedAt: "desc" },
  });

  return versions.map(toMtoVersion);
}

export async function getActiveMtoVersion(): Promise<MtoVersion | undefined> {
  const version = await prisma.mtoVersion.findFirst({
    where: { status: "approved" },
    orderBy: { importedAt: "desc" },
  });

  return version ? toMtoVersion(version) : undefined;
}
