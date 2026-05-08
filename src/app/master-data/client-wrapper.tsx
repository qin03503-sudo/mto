
"use client";
import { Material, Unit, Scope, Part, MtoRow } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { createMaterial, updateMaterial, deleteMaterial, createScope, updateScope, deleteScope, createPart, updatePart, deletePart, createMtoRow, updateMtoRow, deleteMtoRow } from "./actions";
import { useI18n } from "@/i18n/client";

export function MasterDataClientWrapper({ materials, scopes, parts, mtoRows, units }: { materials: Material[]; scopes: Scope[]; parts: Part[]; mtoRows: MtoRow[]; units: Unit[] }) {
  const { dictionary } = useI18n();
  const [activeTab, setActiveTab] = useState<"materials" | "scopes" | "parts" | "mtoRows">("materials");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === "materials" ? "default" : "outline"} onClick={() => setActiveTab("materials")}>{dictionary.common.materials}</Button>
        <Button variant={activeTab === "scopes" ? "default" : "outline"} onClick={() => setActiveTab("scopes")}>{dictionary.common.scopes}</Button>
        <Button variant={activeTab === "parts" ? "default" : "outline"} onClick={() => setActiveTab("parts")}>{dictionary.common.parts}</Button>
        <Button variant={activeTab === "mtoRows" ? "default" : "outline"} onClick={() => setActiveTab("mtoRows")}>{dictionary.masterData.mtoRowsTitle}</Button>
      </div>

      {activeTab === "materials" && <MaterialsTable materials={materials} units={units} />}
      {activeTab === "scopes" && <ScopesTable scopes={scopes} />}
      {activeTab === "parts" && <PartsTable parts={parts} scopes={scopes} />}
      {activeTab === "mtoRows" && <MtoRowsTable mtoRows={mtoRows} scopes={scopes} parts={parts} materials={materials} />}
    </div>
  );
}

function MaterialsTable({ materials, units }: { materials: Material[]; units: Unit[] }) {
  const { dictionary } = useI18n();

  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">{dictionary.common.materials}</h3>
        <MaterialDialog units={units} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{dictionary.common.name}</TableHead>
            <TableHead>{dictionary.common.dimension}</TableHead>
            <TableHead>{dictionary.common.unit}</TableHead>
            <TableHead>{dictionary.common.defaultPrice}</TableHead>
            <TableHead className="w-[100px]">{dictionary.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((m: Material) => (
            <TableRow key={m.id}>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.dimension}</TableCell>
              <TableCell>{units.find((u: Unit) => u.id === m.unitId)?.symbol}</TableCell>
              <TableCell>{m.defaultPrice}</TableCell>
              <TableCell className="flex gap-2">
                <MaterialDialog material={m} units={units} mode="edit" />
                <Button variant="ghost" size="icon" onClick={() => deleteMaterial(m.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MaterialDialog({ material, units, mode = "add" }: { material?: Material; units: Unit[]; mode?: "add" | "edit" }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: formData.get("id") as string || `mat-${Date.now()}`,
      name: formData.get("name") as string,
      dimension: formData.get("dimension") as string,
      unitId: formData.get("unitId") as string,
      defaultPrice: formData.get("defaultPrice") ? Number(formData.get("defaultPrice")) : null,
    };
    if (mode === "add") await createMaterial(data);
    else await updateMaterial(material!.id, data);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />{dictionary.masterData.addMaterial}</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? dictionary.masterData.addMaterial : dictionary.masterData.editMaterial}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && (
            <div><Label>ID</Label><Input name="id" required /></div>
          )}
          <div><Label>{dictionary.common.name}</Label><Input name="name" defaultValue={material?.name} required /></div>
          <div><Label>{dictionary.common.dimension}</Label><Input name="dimension" defaultValue={material?.dimension} required /></div>
          <div>
            <Label>{dictionary.common.unit}</Label>
            <select name="unitId" defaultValue={material?.unitId} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              {units.map((u: Unit) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <div><Label>{dictionary.common.defaultPrice}</Label><Input name="defaultPrice" type="number" step="0.01" defaultValue={material?.defaultPrice === null ? undefined : material?.defaultPrice} /></div>
          <Button type="submit" className="w-full">{dictionary.common.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScopesTable({ scopes }: { scopes: Scope[] }) {
  const { dictionary } = useI18n();

  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">{dictionary.common.scopes}</h3>
        <ScopeDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{dictionary.common.name}</TableHead>
            <TableHead>{dictionary.common.description}</TableHead>
            <TableHead className="w-[100px]">{dictionary.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scopes.map((s: Scope) => (
            <TableRow key={s.id}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.description}</TableCell>
              <TableCell className="flex gap-2">
                <ScopeDialog scope={s} mode="edit" />
                <Button variant="ghost" size="icon" onClick={() => deleteScope(s.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ScopeDialog({ scope, mode = "add" }: { scope?: Scope; mode?: "add" | "edit" }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: formData.get("id") as string || `scope-${Date.now()}`,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };
    if (mode === "add") await createScope(data);
    else await updateScope(scope!.id, data);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />{dictionary.masterData.addScope}</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "add" ? dictionary.masterData.addScope : dictionary.masterData.editScope}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div><Label>{dictionary.common.name}</Label><Input name="name" defaultValue={scope?.name} required /></div>
          <div><Label>{dictionary.common.description}</Label><Input name="description" defaultValue={scope?.description} required /></div>
          <Button type="submit" className="w-full">{dictionary.common.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PartsTable({ parts, scopes }: { parts: Part[]; scopes: Scope[] }) {
  const { dictionary } = useI18n();

  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">{dictionary.common.parts}</h3>
        <PartDialog scopes={scopes} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{dictionary.common.scope}</TableHead>
            <TableHead>{dictionary.common.name}</TableHead>
            <TableHead className="w-[100px]">{dictionary.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((p: Part) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{scopes.find((s: Scope)=>s.id===p.scopeId)?.name}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell className="flex gap-2">
                <PartDialog part={p} scopes={scopes} mode="edit" />
                <Button variant="ghost" size="icon" onClick={() => deletePart(p.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PartDialog({ part, scopes, mode = "add" }: { part?: Part; scopes: Scope[]; mode?: "add" | "edit" }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: formData.get("id") as string || `part-${Date.now()}`,
      scopeId: formData.get("scopeId") as string,
      name: formData.get("name") as string,
    };
    if (mode === "add") await createPart(data);
    else await updatePart(part!.id, data);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />{dictionary.masterData.addPart}</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "add" ? dictionary.masterData.addPart : dictionary.masterData.editPart}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div><Label>{dictionary.common.name}</Label><Input name="name" defaultValue={part?.name} required /></div>
          <div>
            <Label>{dictionary.common.scope}</Label>
            <select name="scopeId" defaultValue={part?.scopeId} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background">
              {scopes.map((s: Scope) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full">{dictionary.common.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MtoRowsTable({ mtoRows, scopes, parts, materials }: { mtoRows: MtoRow[]; scopes: Scope[]; parts: Part[]; materials: Material[] }) {
  const { dictionary } = useI18n();

  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">{dictionary.masterData.mtoRowsTitle}</h3>
        <MtoRowDialog scopes={scopes} parts={parts} materials={materials} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.common.scope}</TableHead>
            <TableHead>{dictionary.common.part}</TableHead>
            <TableHead>{dictionary.common.material}</TableHead>
            <TableHead>{dictionary.common.description}</TableHead>
            <TableHead>{dictionary.common.quantity}</TableHead>
            <TableHead>{dictionary.common.value}</TableHead>
            <TableHead>{dictionary.common.unit}</TableHead>
            <TableHead className="w-[100px]">{dictionary.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mtoRows.map((m: MtoRow) => (
            <TableRow key={m.id}>
              <TableCell>{scopes.find((s: Scope)=>s.id===m.scopeId)?.name}</TableCell>
              <TableCell>{parts.find((p: Part)=>p.id===m.partId)?.name}</TableCell>
              <TableCell>{materials.find((mat: Material)=>mat.id===m.materialId)?.name}</TableCell>
              <TableCell>{m.description}</TableCell>
              <TableCell>{m.quantity}</TableCell>
              <TableCell>{m.value}</TableCell>
              <TableCell>{m.unit}</TableCell>
              <TableCell className="flex gap-2">
                <MtoRowDialog mtoRow={m} scopes={scopes} parts={parts} materials={materials} mode="edit" />
                <Button variant="ghost" size="icon" onClick={() => deleteMtoRow(m.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MtoRowDialog({ mtoRow, scopes, parts, materials, mode = "add" }: { mtoRow?: MtoRow; scopes: Scope[]; parts: Part[]; materials: Material[]; mode?: "add" | "edit" }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: formData.get("id") as string || `mto-${Date.now()}`,
      scopeId: formData.get("scopeId") as string,
      partId: formData.get("partId") as string,
      materialId: formData.get("materialId") as string,
      description: formData.get("description") as string,
      quantity: Number(formData.get("quantity")),
      value: Number(formData.get("value")),
      unit: formData.get("unit") as string,
    };
    if (mode === "add") await createMtoRow(data);
    else await updateMtoRow(mtoRow!.id, data);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />{dictionary.masterData.addMtoRow}</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{mode === "add" ? dictionary.masterData.addMtoRow : dictionary.masterData.editMtoRow}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{dictionary.common.scope}</Label>
              <select name="scopeId" defaultValue={mtoRow?.scopeId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                {scopes.map((s: Scope) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>{dictionary.common.part}</Label>
              <select name="partId" defaultValue={mtoRow?.partId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                {parts.map((p: Part) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>{dictionary.common.material}</Label>
            <select name="materialId" defaultValue={mtoRow?.materialId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
              {materials.map((m: Material) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div><Label>{dictionary.common.description}</Label><Input name="description" defaultValue={mtoRow?.description} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>{dictionary.common.quantity}</Label><Input name="quantity" type="number" step="0.01" defaultValue={mtoRow?.quantity || 1} required /></div>
            <div><Label>{dictionary.common.value}</Label><Input name="value" type="number" step="0.0001" defaultValue={mtoRow?.value} required /></div>
            <div><Label>{dictionary.common.unit}</Label><Input name="unit" defaultValue={mtoRow?.unit} /></div>
          </div>
          <Button type="submit" className="w-full">{dictionary.common.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
