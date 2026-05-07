import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addLineAction,
  addPartAction,
  addScopeAction,
} from "@/app/offers/[id]/scopes-lines/actions";
import { AppShell } from "@/components/app-shell";
import { CalculationStatusBadge } from "@/components/offer-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOfferById } from "@/lib/offers";
import {
  getOfferScopes,
  getPartUnitPrice,
  getPartById,
  getPartsForScope,
  getScopeById,
  getScopeLineSummary,
  scopes,
} from "@/lib/scopes-lines";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function ScopesLinesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const offer = await getOfferById(id);

  if (!offer) {
    notFound();
  }

  const offerScopes = await getOfferScopes(id);
  const summary = await getScopeLineSummary(id);
  const selectedScopeIds = new Set(offerScopes.map((scope) => scope.scopeId));
  const availableScopes = scopes.filter((scope) => !selectedScopeIds.has(scope.id));
  const unitPriceEntries = await Promise.all(
    offerScopes.flatMap((offerScope) => {
      const partIds = new Set([
        ...getPartsForScope(offerScope.scopeId).map((part) => part.id),
        ...offerScope.lines.flatMap((line) => line.parts.map((part) => part.partId)),
      ]);

      return Array.from(partIds).map(async (partId) => [
        `${offerScope.scopeId}:${partId}`,
        await getPartUnitPrice(id, offerScope.scopeId, partId),
      ] as const);
    })
  );
  const unitPrices = new Map(unitPriceEntries);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{offer.name} / Scopes and Lines</CardTitle>
              <CardDescription>
                Select valid scopes, create lines, and add only scope-valid parts with positive quantities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => (
                  <Badge
                    key={scope.id}
                    variant={selectedScopeIds.has(scope.id) ? "default" : "outline"}
                    className="h-7 px-3"
                  >
                    {scope.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <form
                  action={addScopeAction.bind(null, id)}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="scope_id">Add scope</Label>
                    <Select name="scope_id" disabled={availableScopes.length === 0}>
                      <SelectTrigger id="scope_id" className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableScopes.map((scope) => (
                          <SelectItem key={scope.id} value={scope.id}>
                            {scope.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" disabled={availableScopes.length === 0}>
                    Add Scope
                  </Button>
                </form>
                <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/offers/${id}/overview`} />}>
                  Back to overview
                </Button>
              </div>
            </CardContent>
          </Card>

          {offerScopes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No scopes selected</CardTitle>
                <CardDescription>
                  Calculation is blocked until at least one scope is selected.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            offerScopes.map((offerScope) => {
              const scope = getScopeById(offerScope.scopeId);
              const validParts = getPartsForScope(offerScope.scopeId);

              return (
                <Card key={offerScope.id}>
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{scope?.name ?? "Unknown scope"}</CardTitle>
                      <CardDescription>
                        {scope?.description ?? "Scope master data is missing."}
                      </CardDescription>
                    </div>
                    <form
                      action={addLineAction.bind(null, id)}
                      className="flex flex-col gap-2 sm:flex-row sm:items-end"
                    >
                      <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                      <div className="grid gap-2">
                        <Label htmlFor={`line_name_${offerScope.id}`}>Line name</Label>
                        <Input
                          id={`line_name_${offerScope.id}`}
                          name="line_name"
                          placeholder="Line 1"
                          required
                        />
                      </div>
                      <Button size="sm" variant="outline">
                        Add Line
                      </Button>
                    </form>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {offerScope.lines.length === 0 ? (
                      <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                        This scope has no lines. Add at least one line before calculation.
                      </div>
                    ) : (
                      offerScope.lines.map((line) => (
                        <div key={line.id} className="rounded-xl border">
                          <div className="flex flex-col gap-3 border-b bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-medium">{line.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {line.parts.length} parts configured
                              </div>
                            </div>
                            <form
                              action={addPartAction.bind(null, id)}
                              className="grid gap-2 sm:grid-cols-[180px_90px_auto] sm:items-end"
                            >
                              <input type="hidden" name="offer_scope_id" value={offerScope.id} />
                              <input type="hidden" name="line_id" value={line.id} />
                              <div className="grid gap-2">
                                <Label htmlFor={`part_id_${line.id}`}>Part</Label>
                                <Select name="part_id" disabled={validParts.length === 0}>
                                  <SelectTrigger id={`part_id_${line.id}`}>
                                    <SelectValue placeholder="Select part" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {validParts.map((part) => (
                                      <SelectItem key={part.id} value={part.id}>
                                        {part.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`qty_${line.id}`}>Qty</Label>
                                <Input
                                  id={`qty_${line.id}`}
                                  name="qty"
                                  min="0.0001"
                                  step="0.0001"
                                  type="number"
                                  required
                                />
                              </div>
                              <Button size="sm" variant="outline">
                                Add Part
                              </Button>
                            </form>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Part</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="hidden md:table-cell text-right">
                                  Unit price
                                </TableHead>
                                <TableHead className="text-right">Line total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {line.parts.map((linePart) => {
                                const part = getPartById(linePart.partId);
                                const isValidForScope = part?.scopeId === offerScope.scopeId;
                                const unitPrice = unitPrices.get(`${offerScope.scopeId}:${linePart.partId}`) ?? 0;
                                const lineTotal = unitPrice * linePart.qty;

                                return (
                                  <TableRow key={linePart.id}>
                                    <TableCell>
                                      <div className="font-medium">
                                        {part?.name ?? "Unknown part"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {isValidForScope ? "Valid for scope" : "Invalid scope/part combination"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {linePart.qty > 0 ? (
                                        linePart.qty
                                      ) : (
                                        <Badge variant="destructive">Invalid</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right">
                                      {currencyFormatter.format(unitPrice)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {currencyFormatter.format(lineTotal)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ))
                    )}
                    <div className="rounded-xl border bg-muted/50 p-4">
                      <div className="mb-3 text-sm font-medium">Parts available for {scope?.name}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {validParts.map((part) => (
                          <div key={part.id} className="rounded-lg border bg-background p-3 text-sm">
                            <div className="font-medium">{part.name}</div>
                            <div className="text-muted-foreground">
                              {currencyFormatter.format(unitPrices.get(`${offerScope.scopeId}:${part.id}`) ?? 0)} unit price
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Validation state</CardTitle>
            <CardDescription>
              Calculation pre-checks from the docs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryRow label="Selected scopes" value={summary.scopes.toString()} />
            <SummaryRow label="Lines" value={summary.lines.toString()} />
            <SummaryRow label="Line parts" value={summary.parts.toString()} />
            <SummaryRow label="Invalid quantities" value={summary.invalidQuantities.toString()} />
            <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">Calculation status</div>
              <CalculationStatusBadge status={offer.calculationStatus} />
            </div>
            <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
              API ready: <code>GET /api/v1/scopes</code>, <code>GET /api/v1/parts?scope_id=...</code>, and <code>GET /api/v1/offers/{id}/scopes-lines</code>.
            </div>
            <Input placeholder="Fast entry placeholder: line name or part" />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
