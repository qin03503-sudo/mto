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
  const materials = await prisma.material.findMany({ orderBy: { id: "asc" } });

  await prisma.projectMaterialPrice.deleteMany({ where: { offerId } });

  if (materials.length > 0) {
    await prisma.projectMaterialPrice.createMany({
      data: materials.map((material) => ({
        id: `${offerId}-${material.id}`,
        offerId,
        materialId: material.id,
        defaultPrice: material.defaultPrice ?? 0,
        projectPrice: material.defaultPrice,
        isOverridden: false,
      })),
    });
  }

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
