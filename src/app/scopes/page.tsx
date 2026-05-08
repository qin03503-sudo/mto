/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function ScopesPage() {
  const { dictionary } = useI18n();
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
          <div className="text-muted-foreground">{dictionary.common.loading}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="shadow-sm border-border/50 transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{dictionary.masterData.scopesMaster}</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={dictionary.masterData.searchScopes}
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
                <Link href="/scopes/new">
                  <Button variant="default" size="icon" aria-label={`${dictionary.common.addNew} ${dictionary.common.scope}`}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
              {scopesData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  {dictionary.masterData.noScopes}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.masterData.scopeName}</TableHead>
                      <TableHead>{dictionary.common.description}</TableHead>
                      <TableHead className="w-20">{dictionary.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scopesData.map((scope) => (
                      <TableRow key={scope.id} className="hover:bg-muted/50 py-2">
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
                              aria-label={`${dictionary.common.edit} ${dictionary.common.scope}`}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`${dictionary.common.delete} ${dictionary.common.scope}`}
                            onClick={async () => {
                              if (window.confirm(dictionary.masterData.deleteScopeConfirm)) {
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
                                  alert(dictionary.masterData.failedDeleteScope);
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
