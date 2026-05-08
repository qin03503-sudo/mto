"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Label,
} from "@/components/ui/label";

export default function NewMtoRowPage() {
  const [scopes, setScopes] = useState<Array<{id: string; name: string}>>([]);
  const [parts, setParts] = useState<Array<{id: string; name: string; scopeId: string}>>([]);
  const [materials, setMaterials] = useState<Array<{id: string; name: string}>>([]);
  const [scopeId, setScopeId] = useState("");
  const [partId, setPartId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch scopes, parts, and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scopesRes, partsRes, materialsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/scopes`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/parts`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/materials`).then(r => r.json()),
        ]);

        if (scopesRes.data) setScopes(scopesRes.data);
        if (partsRes.data) setParts(partsRes.data);
        if (materialsRes.data) setMaterials(materialsRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };

    fetchData();
  }, []);

  // Filter parts by selected scope
  const filteredParts = scopeId ? parts.filter(p => p.scopeId === scopeId) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/mto-rows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scopeId,
          partId: scopeId ? partId : undefined,
          materialId,
          description,
          quantity: parseFloat(quantity),
          value: parseFloat(value),
          unit,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create MTO row");
      }

      // Redirect to the list page
      window.location.href = "/mto-rows";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New MTO Row</CardTitle>
              <Link href="/mto-rows">
                <Button variant="outline" size="icon" aria-label="Go back to list">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="scope_id">Scope</Label>
                <Select
                  value={scopeId}
                  onValueChange={(value) => setScopeId(value ?? "")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="scope_id">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopes.map(scope => (
                      <SelectItem key={scope.id} value={scope.id}>
                        {scope.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="part_id">Part</Label>
                <Select
                  value={partId}
                  onValueChange={(value) => setPartId(value ?? "")}
                  disabled={isSubmitting || !scopeId || filteredParts.length === 0}
                >
                  <SelectTrigger id="part_id">
                    <SelectValue placeholder="Select part" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredParts.map(part => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="material_id">Material</Label>
                <Select
                  value={materialId}
                  onValueChange={(value) => setMaterialId(value ?? "")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="material_id">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g., Kg, PCS, m2"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => window.location.href = "/mto-rows"}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create MTO Row"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
