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

export default function PartsPage() {
  const [partsData, setPartsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/parts`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch parts");
        return res.json();
      })
      .then((json) => setPartsData(json.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
              <CardTitle>Parts Master</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search parts..."
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
                <Link href="/parts/new">
                  <Button variant="default" size="icon" aria-label="Add new part">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              {partsData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No parts found. Click the + button to add one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partsData.map((part: any) => (
                      <TableRow key={part.id} className="hover:bg-muted">
                        <TableCell>
                          <div className="font-medium">{part.name}</div>
                        </TableCell>
                        <TableCell>
                          {part.scope ? part.scope.name : "Unknown Scope"}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 text-right">
                          <Link href={`/parts/${part.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit part"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label="Delete part"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this part?")) {
                                try {
                                  const deleteRes = await fetch(`/api/v1/parts?id=${part.id}`, {
                                    method: "DELETE",
                                  });
                                  if (!deleteRes.ok) {
                                    throw new Error("Failed to delete");
                                  }
                                  // Refetch the data
                                  window.location.reload();
                                } catch (error) {
                                  alert("Failed to delete part");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
