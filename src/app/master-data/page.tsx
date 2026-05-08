import { Database, Factory, Layers3, PackageSearch } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMaterials, getMtoVersions, getUnits } from "@/lib/master-data";
import { getMtoRows, getPartsForScope, getScopes } from "@/lib/scopes-lines";
import { MasterDataClientWrapper } from "./client-wrapper";

export default async function MasterDataPage() {
  const [materials, , units, scopes, parts, mtoRows] = await Promise.all([
    getMaterials(),
    getMtoVersions(),
    getUnits(),
    getScopes(),
    getPartsForScope(),
    getMtoRows(),
  ]);

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Materials" value={materials.length} icon={<Factory />} />
        <MetricCard title="Scopes" value={scopes.length} icon={<Layers3 />} />
        <MetricCard title="Parts" value={parts.length} icon={<PackageSearch />} />
        <MetricCard title="MTO rows" value={mtoRows.length} icon={<Database />} />
      </section>

      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Manage Master Data</CardTitle>
            <CardDescription>Full CRUD operations for materials, scopes, parts, and MTO rows.</CardDescription>
          </CardHeader>
          <CardContent>
            <MasterDataClientWrapper
              materials={materials}
              scopes={scopes}
              parts={parts}
              mtoRows={mtoRows}
              units={units}
            />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode; }) {
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
