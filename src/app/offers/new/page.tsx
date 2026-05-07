import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";

import { createOfferAction } from "@/app/offers/new/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
      <section>
        <Card className="mx-auto max-w-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Create Offer</CardTitle>
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
