"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n/client";

export default function MaterialsPage() {
  const { dictionary } = useI18n();
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/materials`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/units`).then((r) => r.json()),
    ])
      .then(([materialsJson, unitsJson]) => {
        setMaterialsData(materialsJson.data || []);
        setUnitsData(unitsJson.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const unitsById = new Map(unitsData.map((u: any) => [u.id, u]));

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">{dictionary.common.loading}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{dictionary.masterData.materialsMaster}</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={dictionary.masterData.searchMaterials}
                  className="h-10 w-48"
                  // In a real implementation, you would add search/filter logic here
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={dictionary.common.refresh}
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Link href="/materials/new">
                  <Button variant="default" size="icon" aria-label={`${dictionary.common.addNew} ${dictionary.common.material}`}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              {materialsData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  {dictionary.masterData.noMaterials}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.common.material}</TableHead>
                      <TableHead>{dictionary.common.unit}</TableHead>
                      <TableHead className="text-center">{dictionary.common.defaultPrice}</TableHead>
                      <TableHead className="w-20">{dictionary.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialsData.map((material: any) => {
                      const unit = unitsById.get(material.unitId);
                      return (
                        <TableRow key={material.id} className="hover:bg-muted">
                          <TableCell>
                            <div className="font-medium">{material.name}</div>
                            <div className="text-xs text-muted-foreground">{material.dimension}</div>
                          </TableCell>
                          <TableCell>{unit?.symbol ?? "-"}</TableCell>
                          <TableCell className="text-center">
                            {material.defaultPrice === null
                              ? dictionary.common.unresolved
                              : material.defaultPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 text-right">
                            <Link href={`/materials/${material.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`${dictionary.common.edit} ${dictionary.common.material}`}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label={`${dictionary.common.delete} ${dictionary.common.material}`}
                              onClick={async () => {
                                if (window.confirm(dictionary.masterData.deleteMaterialConfirm)) {
                                  try {
                                    const deleteRes = await fetch(`/api/v1/materials?id=${material.id}`, {
                                      method: "DELETE",
                                    });
                                    if (!deleteRes.ok) {
                                      throw new Error("Failed to delete");
                                    }
                                    // Refetch the data
                                    window.location.reload();
                                  } catch (error) {
                                    alert(dictionary.masterData.failedDeleteMaterial);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
