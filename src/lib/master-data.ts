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
};

export type MtoVersion = {
  id: string;
  version: string;
  importedAt: string;
  status: "draft" | "approved" | "archived";
};

export const units: Unit[] = [
  { id: "unit-kg", name: "Kilogram", symbol: "Kg" },
  { id: "unit-pcs", name: "Pieces", symbol: "PCS" },
  { id: "unit-m2", name: "Square meter", symbol: "m2" },
];

export const materials: Material[] = [
  {
    id: "mat-al-profile",
    name: "Al profile",
    dimension: "Extruded body",
    unitId: "unit-kg",
    defaultPrice: 1000,
  },
  {
    id: "mat-bolt-6x20",
    name: "Bolt 6x20",
    dimension: "Galvanized",
    unitId: "unit-pcs",
    defaultPrice: 50,
  },
  {
    id: "mat-copper-bar",
    name: "Copper bar",
    dimension: "Tinned copper",
    unitId: "unit-kg",
    defaultPrice: 4500,
  },
  {
    id: "mat-insulator",
    name: "Insulator",
    dimension: "Support block",
    unitId: "unit-pcs",
    defaultPrice: 320,
  },
  {
    id: "mat-paint",
    name: "Powder coating",
    dimension: "RAL finish",
    unitId: "unit-m2",
    defaultPrice: null,
  },
];

export const mtoVersions: MtoVersion[] = [
  {
    id: "mto-version-2026-05",
    version: "2026.05",
    importedAt: "2026-05-07T09:00:00.000Z",
    status: "approved",
  },
  {
    id: "mto-version-2026-04",
    version: "2026.04",
    importedAt: "2026-04-21T09:00:00.000Z",
    status: "archived",
  },
];
