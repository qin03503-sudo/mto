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
import { priceCurrencies } from "@/lib/currency";
import { getDictionary } from "@/i18n/server";

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const dictionary = await getDictionary();

  return (
    <AppShell>
      <section>
        <Card className="mx-auto max-w-3xl shadow-sm">
          <CardHeader>
            <CardTitle>{dictionary.offers.createOfferTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createOfferAction} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name">{dictionary.offers.offerName}</Label>
                <Input id="name" name="name" placeholder={dictionary.offers.projectPlaceholder} required />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="offer_number">{dictionary.offers.offerNumber}</Label>
                  <Input
                    id="offer_number"
                    name="offer_number"
                    placeholder={dictionary.offers.offerNumberPlaceholder}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">{dictionary.common.type}</Label>
                  <Select name="type" defaultValue="standard">
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder={dictionary.offers.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{dictionary.offers.standard}</SelectItem>
                      <SelectItem value="custom">{dictionary.offers.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">{dictionary.common.currency}</Label>
                  <Select name="currency" defaultValue="USD">
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceCurrencies.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="input_date">{dictionary.common.inputDate}</Label>
                  <Input id="input_date" name="input_date" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="close_date">{dictionary.common.closeDate}</Label>
                  <Input id="close_date" name="close_date" type="date" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{dictionary.common.description}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={dictionary.offers.optionalNotes}
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
                  {dictionary.common.cancel}
                </Button>
                <Button type="submit">
                  <FilePlus2 />
                  {dictionary.common.createOffer}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
