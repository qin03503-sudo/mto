import { prisma } from "@/lib/prisma";

export type MaterialPrice = {
  materialId: string;
  material: string;
  dimension: string;
  unit: string;
  defaultPrice: number;
  projectPrice: number | null;
  isOverridden: boolean;
};

export const baseMaterialPrices: MaterialPrice[] = [
  {
    materialId: "mat-al-profile",
    material: "Al profile",
    dimension: "Extruded body",
    unit: "Kg",
    defaultPrice: 1000,
    projectPrice: 1200,
    isOverridden: true,
  },
  {
    materialId: "mat-bolt-6x20",
    material: "Bolt 6x20",
    dimension: "Galvanized",
    unit: "PCS",
    defaultPrice: 50,
    projectPrice: 50,
    isOverridden: false,
  },
  {
    materialId: "mat-copper-bar",
    material: "Copper bar",
    dimension: "Tinned copper",
    unit: "Kg",
    defaultPrice: 4500,
    projectPrice: 4500,
    isOverridden: false,
  },
  {
    materialId: "mat-insulator",
    material: "Insulator",
    dimension: "Support block",
    unit: "PCS",
    defaultPrice: 320,
    projectPrice: 295,
    isOverridden: true,
  },
  {
    materialId: "mat-paint",
    material: "Powder coating",
    dimension: "RAL finish",
    unit: "m2",
    defaultPrice: 180,
    projectPrice: null,
    isOverridden: false,
  },
];

export const seedProjectPrices: Record<string, MaterialPrice[]> = {
  "off-2026-001": baseMaterialPrices.map((price) => ({ ...price })),
  "off-2026-002": baseMaterialPrices.map((price) => ({
    ...price,
    projectPrice:
      price.materialId === "mat-al-profile"
        ? 1100
        : price.materialId === "mat-copper-bar"
          ? 4700
          : price.projectPrice,
    isOverridden:
      price.materialId === "mat-al-profile" ||
      price.materialId === "mat-copper-bar" ||
      price.isOverridden,
  })),
  "off-2026-003": baseMaterialPrices.map((price) => ({
    ...price,
    projectPrice: price.materialId === "mat-paint" ? 180 : price.projectPrice,
    isOverridden: price.materialId === "mat-paint" ? false : price.isOverridden,
  })),
};

function toMaterialPrice(price: {
  materialId: string;
  defaultPrice: number;
  projectPrice: number | null;
  isOverridden: boolean;
  material: {
    name: string;
    dimension: string;
    unit: { symbol: string };
  };
}): MaterialPrice {
  return {
    materialId: price.materialId,
    material: price.material.name,
    dimension: price.material.dimension,
    unit: price.material.unit.symbol,
    defaultPrice: price.defaultPrice,
    projectPrice: price.projectPrice,
    isOverridden: price.isOverridden,
  };
}

export async function initializeProjectMaterialPrices(
  offerId: string
): Promise<MaterialPrice[]> {
  await prisma.projectMaterialPrice.deleteMany({ where: { offerId } });

  await prisma.projectMaterialPrice.createMany({
    data: baseMaterialPrices.map((price) => ({
      id: `${offerId}-${price.materialId}`,
      offerId,
      materialId: price.materialId,
      defaultPrice: price.defaultPrice,
      projectPrice: price.defaultPrice,
      isOverridden: false,
    })),
  });

  return getMaterialPricesForOffer(offerId);
}

export async function getMaterialPricesForOffer(
  offerId: string
): Promise<MaterialPrice[]> {
  const prices = await prisma.projectMaterialPrice.findMany({
    where: { offerId },
    include: { material: { include: { unit: true } } },
    orderBy: { materialId: "asc" },
  });

  if (prices.length === 0) {
    return initializeProjectMaterialPrices(offerId);
  }

  return prices.map(toMaterialPrice);
}

export async function updateProjectMaterialPrice(
  offerId: string,
  materialId: string,
  projectPrice: number
) {
  const existing = await prisma.projectMaterialPrice.findUnique({
    where: { offerId_materialId: { offerId, materialId } },
    include: { material: { include: { unit: true } } },
  });

  if (!existing) {
    return undefined;
  }

  const material = await prisma.projectMaterialPrice.update({
    where: { offerId_materialId: { offerId, materialId } },
    data: {
      projectPrice,
      isOverridden: projectPrice !== existing.defaultPrice,
    },
    include: { material: { include: { unit: true } } },
  });

  return toMaterialPrice(material);
}

export async function getMaterialPriceSummary(offerId: string) {
  const prices = await getMaterialPricesForOffer(offerId);

  return {
    total: prices.length,
    overridden: prices.filter((price) => price.isOverridden).length,
    unresolved: prices.filter((price) => price.projectPrice === null).length,
  };
}
