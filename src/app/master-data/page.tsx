import { Database, Factory, Layers3, PackageSearch } from "lucide-react";

import { AppShell } from "@/components/app-shell";
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
import { materials, mtoVersions, units } from "@/lib/master-data";
import { mtoRows, parts, scopes } from "@/lib/scopes-lines";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export default function MasterDataPage() {
  const activeVersion = mtoVersions.find((version) => version.status === "approved");

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Materials" value={materials.length} icon={<Factory />} />
        <MetricCard title="Scopes" value={scopes.length} icon={<Layers3 />} />
        <MetricCard title="Parts" value={parts.length} icon={<PackageSearch />} />
        <MetricCard title="MTO rows" value={mtoRows.length} icon={<Database />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Material Master</CardTitle>
            <CardDescription>
              Default prices copied into every new offer as project material prices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const unit = units.find((candidate) => candidate.id === material.unitId);

                    return (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-xs text-muted-foreground">{material.dimension}</div>
                        </TableCell>
                        <TableCell>{unit?.symbol ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          {material.defaultPrice === null
                            ? "Unresolved"
                            : numberFormatter.format(material.defaultPrice)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Scope And Part Catalog</CardTitle>
            <CardDescription>
              Parts are constrained by scope to prevent invalid offer line items.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {scopes.map((scope) => {
              const scopeParts = parts.filter((part) => part.scopeId === scope.id);

              return (
                <div key={scope.id} className="rounded-2xl border bg-muted/30 p-4">
                  <div className="font-medium">{scope.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{scope.description}</div>
                  <div className="mt-4 space-y-2">
                    {scopeParts.map((part) => (
                      <div key={part.id} className="rounded-xl bg-background px-3 py-2 text-sm shadow-sm ring-1 ring-border">
                        {part.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>MTO Master Rows</CardTitle>
          <CardDescription>
            Active version {activeVersion?.version ?? "not selected"}; calculation uses value multiplied by project material price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mtoRows.map((row) => {
                  const scope = scopes.find((candidate) => candidate.id === row.scopeId);
                  const part = parts.find((candidate) => candidate.id === row.partId);
                  const material = materials.find((candidate) => candidate.id === row.materialId);

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{scope?.name ?? "Unknown"}</TableCell>
                      <TableCell>{part?.name ?? "Unknown"}</TableCell>
                      <TableCell>
                        <div className="font-medium">{material?.name ?? "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{row.description}</div>
                      </TableCell>
                      <TableCell className="text-right">{numberFormatter.format(row.value)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 [&_svg]:size-4">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
