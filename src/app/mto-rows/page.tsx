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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export default function MtoRowsPage() {
  const [mtoRowsData, setMtoRowsData] = useState<any[]>([]);
  const [scopesData, setScopesData] = useState<any[]>([]);
  const [partsData, setPartsData] = useState<any[]>([]);
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/mto-rows`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/scopes`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/parts`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/materials`).then((r) => r.json()),
    ])
      .then(([mtoJson, scopesJson, partsJson, materialsJson]) => {
        setMtoRowsData(mtoJson.data || []);
        setScopesData(scopesJson.data || []);
        setPartsData(partsJson.data || []);
        setMaterialsData(materialsJson.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const scopesById = new Map(scopesData.map((s: any) => [s.id, s]));
  const partsById = new Map(partsData.map((p: any) => [p.id, p]));
  const materialsById = new Map(materialsData.map((m: any) => [m.id, m]));

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading...</div>
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
              <CardTitle>MTO Master Rows</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search MTO rows..."
                  className="h-10 w-48"
                  // In a real implementation, you would add search/filter logic here
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Refresh"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Link href="/mto-rows/new">
                  <Button variant="default" size="icon" aria-label="Add new MTO row">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              {mtoRowsData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No MTO rows found. Click the + button to add one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Part</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Value</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mtoRowsData.map((row: any) => {
                      const scope = scopesById.get(row.scopeId);
                      const part = partsById.get(row.partId);
                      const material = materialsById.get(row.materialId);
                      return (
                        <TableRow key={row.id} className="hover:bg-muted">
                          <TableCell>
                            {scope?.name ?? "Unknown Scope"}
                          </TableCell>
                          <TableCell>
                            {part?.name ?? "Unknown Part"}
                          </TableCell>
                          <TableCell>
                            {material?.name ?? "Unknown Material"}
                          </TableCell>
                          <TableCell className="text-center">{row.quantity}</TableCell>
                          <TableCell className="text-center">
                            {currencyFormatter.format(row.value)}
                          </TableCell>
                          <TableCell className="text-center">{row.unit || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {row.description || "-"}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 text-right">
                            <Link href={`/mto-rows/${row.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit MTO row"
                              >
                                <Edit className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Delete MTO row"
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to delete this MTO row?")) {
                                  try {
                                    const deleteRes = await fetch(`/api/v1/mto-rows?id=${row.id}`, {
                                      method: "DELETE",
                                    });
                                    if (!deleteRes.ok) {
                                      throw new Error("Failed to delete");
                                    }
                                    // Refetch the data
                                    window.location.reload();
                                  } catch (error) {
                                    alert("Failed to delete MTO row");
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
