import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const units = [
  { id: "unit-kg", name: "Kilogram", symbol: "Kg" },
  { id: "unit-pcs", name: "Pieces", symbol: "PCS" },
  { id: "unit-m2", name: "Square meter", symbol: "m2" },
];

const materials = [
  { id: "mat-al-profile", name: "Al profile", dimension: "Extruded body", unitId: "unit-kg", defaultPrice: 1000 },
  { id: "mat-bolt-6x20", name: "Bolt 6x20", dimension: "Galvanized", unitId: "unit-pcs", defaultPrice: 50 },
  { id: "mat-copper-bar", name: "Copper bar", dimension: "Tinned copper", unitId: "unit-kg", defaultPrice: 4500 },
  { id: "mat-insulator", name: "Insulator", dimension: "Support block", unitId: "unit-pcs", defaultPrice: 320 },
  { id: "mat-paint", name: "Powder coating", dimension: "RAL finish", unitId: "unit-m2", defaultPrice: null },
];

const offers = [
  {
    id: "off-2026-001",
    name: "Metro Line Busduct Package",
    offerNumber: "OFF-2026-001",
    type: "standard",
    inputDate: "2026-05-07",
    closeDate: "2026-05-20",
    owner: "Estimator",
    status: "pricing",
    calculationStatus: "outdated",
    description: "Busduct package for the metro line expansion tender.",
    scopes: 2,
    lines: 2,
    total: 428500,
  },
  {
    id: "off-2026-002",
    name: "Hospital Tower Expansion",
    offerNumber: "OFF-2026-002",
    type: "custom",
    inputDate: "2026-05-04",
    closeDate: "2026-05-18",
    owner: "Sales",
    status: "pricing",
    calculationStatus: "not_calculated",
    description: "Custom package requiring hospital tower material overrides.",
    scopes: 1,
    lines: 1,
    total: 184200,
  },
  {
    id: "off-2026-003",
    name: "Airport Service Building",
    offerNumber: "OFF-2026-003",
    type: "standard",
    inputDate: "2026-04-29",
    closeDate: "2026-05-15",
    owner: "Manager",
    status: "ready",
    calculationStatus: "current",
    description: "Ready customer output for airport service building review.",
    scopes: 0,
    lines: 0,
    total: 612900,
  },
];

const scopes = [
  { id: "scope-1000a-al", name: "1000A AL", description: "Aluminum busduct scope for 1000A feeders." },
  { id: "scope-1600a-al", name: "1600A AL", description: "Aluminum busduct scope for 1600A feeders." },
  { id: "scope-2500a-cu", name: "2500A CU", description: "Copper busduct scope for high-current lines." },
];

const parts = [
  { id: "part-feeder-1000", scopeId: "scope-1000a-al", name: "FEEDER-1000" },
  { id: "part-top-off-box-250", scopeId: "scope-1000a-al", name: "TOP OFF BOX 250" },
  { id: "part-elbow-1000", scopeId: "scope-1000a-al", name: "ELBOW-1000" },
  { id: "part-feeder-1600", scopeId: "scope-1600a-al", name: "FEEDER-1600" },
  { id: "part-plug-in-1600", scopeId: "scope-1600a-al", name: "PLUG IN BOX 1600" },
  { id: "part-feeder-2500-cu", scopeId: "scope-2500a-cu", name: "FEEDER-2500 CU" },
];

const mtoRows = [
  { id: "mto-feeder-1000-al-profile", scopeId: "scope-1000a-al", partId: "part-feeder-1000", materialId: "mat-al-profile", description: "Aluminum profile body", quantity: 1, value: 668916.6986, unit: "Kg" },
  { id: "mto-feeder-1000-bolts", scopeId: "scope-1000a-al", partId: "part-feeder-1000", materialId: "mat-bolt-6x20", description: "Connection bolts", quantity: 12, value: 12, unit: "PCS" },
  { id: "mto-top-off-al-profile", scopeId: "scope-1000a-al", partId: "part-top-off-box-250", materialId: "mat-al-profile", description: "Tap-off enclosure profile", quantity: 1, value: 183600, unit: "Kg" },
  { id: "mto-elbow-al-profile", scopeId: "scope-1000a-al", partId: "part-elbow-1000", materialId: "mat-al-profile", description: "Elbow aluminum profile", quantity: 1, value: 123333.3333, unit: "Kg" },
  { id: "mto-feeder-1600-al-profile", scopeId: "scope-1600a-al", partId: "part-feeder-1600", materialId: "mat-al-profile", description: "1600A aluminum body", quantity: 1, value: 995833.3333, unit: "Kg" },
  { id: "mto-plug-in-1600-insulator", scopeId: "scope-1600a-al", partId: "part-plug-in-1600", materialId: "mat-insulator", description: "Plug-in support insulators", quantity: 1, value: 1305084.7458, unit: "PCS" },
  { id: "mto-feeder-2500-cu-copper", scopeId: "scope-2500a-cu", partId: "part-feeder-2500-cu", materialId: "mat-copper-bar", description: "Copper conductor bars", quantity: 1, value: 408888.8889, unit: "Kg" },
];

const mtoVersions = [
  { id: "mto-version-2026-05", version: "2026.05", importedAt: "2026-05-07T09:00:00.000Z", status: "approved" },
  { id: "mto-version-2026-04", version: "2026.04", importedAt: "2026-04-21T09:00:00.000Z", status: "archived" },
];

const projectMaterialPrices = {
  "off-2026-001": [1200, 50, 4500, 295, null],
  "off-2026-002": [1100, 50, 4700, 295, null],
  "off-2026-003": [1200, 50, 4500, 295, 180],
} as const;

const offerScopes = [
  { id: "offer-scope-001-1000a", offerId: "off-2026-001", scopeId: "scope-1000a-al" },
  { id: "offer-scope-001-1600a", offerId: "off-2026-001", scopeId: "scope-1600a-al" },
  { id: "offer-scope-002-1000a", offerId: "off-2026-002", scopeId: "scope-1000a-al" },
];

const offerLines = [
  { id: "line-001-main-riser", offerScopeId: "offer-scope-001-1000a", name: "Main riser" },
  { id: "line-001-plant-room", offerScopeId: "offer-scope-001-1600a", name: "Plant room feeder" },
  { id: "line-002-east-wing", offerScopeId: "offer-scope-002-1000a", name: "East wing" },
];

const offerLineParts = [
  { id: "line-part-001-feeder", lineId: "line-001-main-riser", partId: "part-feeder-1000", qty: 1 },
  { id: "line-part-001-top-off", lineId: "line-001-main-riser", partId: "part-top-off-box-250", qty: 2 },
  { id: "line-part-001-feeder-1600", lineId: "line-001-plant-room", partId: "part-feeder-1600", qty: 1 },
  { id: "line-part-002-elbow", lineId: "line-002-east-wing", partId: "part-elbow-1000", qty: 4 },
];

async function main() {
  await prisma.calculationRun.deleteMany();
  await prisma.offerLinePart.deleteMany();
  await prisma.offerLine.deleteMany();
  await prisma.offerScope.deleteMany();
  await prisma.projectMaterialPrice.deleteMany();
  await prisma.mtoRow.deleteMany();
  await prisma.part.deleteMany();
  await prisma.scope.deleteMany();
  await prisma.material.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.mtoVersion.deleteMany();
  await prisma.offer.deleteMany();

  await prisma.unit.createMany({ data: units });
  await prisma.material.createMany({ data: materials });
  await prisma.scope.createMany({ data: scopes });
  await prisma.part.createMany({ data: parts });
  await prisma.mtoRow.createMany({ data: mtoRows });
  await prisma.mtoVersion.createMany({ data: mtoVersions });
  await prisma.offer.createMany({ data: offers });

  for (const offer of offers) {
    const prices = projectMaterialPrices[offer.id as keyof typeof projectMaterialPrices];

    await prisma.projectMaterialPrice.createMany({
      data: materials.map((material, index) => {
        const defaultPrice = material.id === "mat-paint" ? 180 : material.defaultPrice ?? 0;
        const projectPrice = prices[index];

        return {
          id: `${offer.id}-${material.id}`,
          offerId: offer.id,
          materialId: material.id,
          defaultPrice,
          projectPrice,
          isOverridden: projectPrice !== null && projectPrice !== defaultPrice,
        };
      }),
    });
  }

  await prisma.offerScope.createMany({ data: offerScopes });
  await prisma.offerLine.createMany({ data: offerLines });
  await prisma.offerLinePart.createMany({ data: offerLineParts });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
