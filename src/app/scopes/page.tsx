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

export default function ScopesPage() {
  const [scopesData, setScopesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/scopes`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch scopes");
        return res.json();
      })
      .then((json) => setScopesData(json.data || []))
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
              <CardTitle>Scopes Master</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search scopes..."
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
                <Link href="/scopes/new">
                  <Button variant="default" size="icon" aria-label="Add new scope">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              {scopesData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No scopes found. Click the + button to add one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scopesData.map((scope) => (
                      <TableRow key={scope.id} className="hover:bg-muted">
                        <TableCell>
                          <div className="font-medium">{scope.name}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {scope.description || "-"}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 text-right">
                          <Link href={`/scopes/${scope.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit scope"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label="Delete scope"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this scope?")) {
                                try {
                                  const deleteRes = await fetch(`/api/v1/scopes?id=${scope.id}`, {
                                    method: "DELETE",
                                  });
                                  if (!deleteRes.ok) {
                                    throw new Error("Failed to delete");
                                  }
                                  // Refetch the data
                                  window.location.reload();
                                } catch (error) {
                                  alert("Failed to delete scope");
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
