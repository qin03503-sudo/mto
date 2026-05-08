
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

export function MasterDataClientWrapper({ materials, scopes, parts, mtoRows, units }: { materials: Material[]; scopes: Scope[]; parts: Part[]; mtoRows: MtoRow[]; units: Unit[] }) {
  const [activeTab, setActiveTab] = useState<"materials" | "scopes" | "parts" | "mtoRows">("materials");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === "materials" ? "default" : "outline"} onClick={() => setActiveTab("materials")}>Materials</Button>
        <Button variant={activeTab === "scopes" ? "default" : "outline"} onClick={() => setActiveTab("scopes")}>Scopes</Button>
        <Button variant={activeTab === "parts" ? "default" : "outline"} onClick={() => setActiveTab("parts")}>Parts</Button>
        <Button variant={activeTab === "mtoRows" ? "default" : "outline"} onClick={() => setActiveTab("mtoRows")}>MTO Rows</Button>
      </div>

      {activeTab === "materials" && <MaterialsTable materials={materials} units={units} />}
      {activeTab === "scopes" && <ScopesTable scopes={scopes} />}
      {activeTab === "parts" && <PartsTable parts={parts} scopes={scopes} />}
      {activeTab === "mtoRows" && <MtoRowsTable mtoRows={mtoRows} scopes={scopes} parts={parts} materials={materials} />}
    </div>
  );
}

function MaterialsTable({ materials, units }: { materials: Material[]; units: Unit[] }) {
  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">Materials</h3>
        <MaterialDialog units={units} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Dimension</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Default Price</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add Material</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Material" : "Edit Material"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && (
            <div><Label>ID</Label><Input name="id" required /></div>
          )}
          <div><Label>Name</Label><Input name="name" defaultValue={material?.name} required /></div>
          <div><Label>Dimension</Label><Input name="dimension" defaultValue={material?.dimension} required /></div>
          <div>
            <Label>Unit</Label>
            <select name="unitId" defaultValue={material?.unitId} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              {units.map((u: Unit) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <div><Label>Default Price</Label><Input name="defaultPrice" type="number" step="0.01" defaultValue={material?.defaultPrice === null ? undefined : material?.defaultPrice} /></div>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScopesTable({ scopes }: { scopes: Scope[] }) {
  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">Scopes</h3>
        <ScopeDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add Scope</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "add" ? "Add Scope" : "Edit Scope"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div><Label>Name</Label><Input name="name" defaultValue={scope?.name} required /></div>
          <div><Label>Description</Label><Input name="description" defaultValue={scope?.description} required /></div>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PartsTable({ parts, scopes }: { parts: Part[]; scopes: Scope[] }) {
  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">Parts</h3>
        <PartDialog scopes={scopes} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add Part</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "add" ? "Add Part" : "Edit Part"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div><Label>Name</Label><Input name="name" defaultValue={part?.name} required /></div>
          <div>
            <Label>Scope</Label>
            <select name="scopeId" defaultValue={part?.scopeId} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background">
              {scopes.map((s: Scope) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MtoRowsTable({ mtoRows, scopes, parts, materials }: { mtoRows: MtoRow[]; scopes: Scope[]; parts: Part[]; materials: Material[] }) {
  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
        <h3 className="font-semibold text-lg">MTO Rows</h3>
        <MtoRowDialog scopes={scopes} parts={parts} materials={materials} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scope</TableHead>
            <TableHead>Part</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-2" />Add MTO Row</Button>
          ) : (
            <Button variant="ghost" size="icon"><EditIcon className="w-4 h-4" /></Button>
          )
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{mode === "add" ? "Add MTO Row" : "Edit MTO Row"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && <div><Label>ID</Label><Input name="id" required /></div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scope</Label>
              <select name="scopeId" defaultValue={mtoRow?.scopeId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                {scopes.map((s: Scope) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Part</Label>
              <select name="partId" defaultValue={mtoRow?.partId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                {parts.map((p: Part) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Material</Label>
            <select name="materialId" defaultValue={mtoRow?.materialId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
              {materials.map((m: Material) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div><Label>Description</Label><Input name="description" defaultValue={mtoRow?.description} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Quantity</Label><Input name="quantity" type="number" step="0.01" defaultValue={mtoRow?.quantity || 1} required /></div>
            <div><Label>Value</Label><Input name="value" type="number" step="0.0001" defaultValue={mtoRow?.value} required /></div>
            <div><Label>Unit</Label><Input name="unit" defaultValue={mtoRow?.unit} /></div>
          </div>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
