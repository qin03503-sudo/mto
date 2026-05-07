import Link from "next/link";
import { ArrowLeft, FilePlus2, Layers3, PackageCheck } from "lucide-react";

import { createOfferAction } from "@/app/offers/new/actions";
import { AppShell } from "@/components/app-shell";
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
import { Textarea } from "@/components/ui/textarea";

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AppShell>
      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit shadow-sm">
          <CardHeader>
            <CardDescription>New proposal setup</CardDescription>
            <CardTitle className="text-2xl">Create the offer record before pricing.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              { icon: FilePlus2, text: "Validate unique offer number and project dates." },
              { icon: PackageCheck, text: "Copy default material prices into project prices." },
              { icon: Layers3, text: "Continue to scope, line, part, and quantity setup." },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.text} className="flex gap-3 rounded-xl border bg-muted/30 p-3">
                  <Icon className="mt-0.5 size-4 text-foreground" />
                  <div>{item.text}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create Offer</CardTitle>
            <CardDescription>
              Required offer metadata. Persisting this copies default material prices into project prices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createOfferAction} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name">Offer name</Label>
                <Input id="name" name="name" placeholder="Project A" required />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="offer_number">Offer number</Label>
                  <Input
                    id="offer_number"
                    name="offer_number"
                    placeholder="OFF-2026-004"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue="standard">
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="input_date">Input date</Label>
                  <Input id="input_date" name="input_date" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="close_date">Close date</Label>
                  <Input id="close_date" name="close_date" type="date" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optional notes for the pricing team"
                />
              </div>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              ) : null}
              <div className="rounded-2xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                After creation, the offer opens in Draft with empty scopes and project-level material prices copied from the material master.
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button nativeButton={false} variant="outline" render={<Link href="/offers" />}>
                  <ArrowLeft />
                  Cancel
                </Button>
                <Button type="submit">
                  <FilePlus2 />
                  Create offer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
