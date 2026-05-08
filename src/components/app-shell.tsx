"use client";

import {
  Calculator,
  Database,
  FilePlus2,
  LayoutDashboard,
  BarChart3,
  BookOpenText,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n, useLocalizedPath } from "@/i18n/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dictionary } = useI18n();
  const localizePath = useLocalizedPath();
  const navItems = [
    { href: "/offers", label: dictionary.shell.offers, icon: LayoutDashboard },
    { href: "/offers/new", label: dictionary.shell.newOffer, icon: FilePlus2 },
    { href: "/dashboard", label: dictionary.shell.dashboard, icon: BarChart3 },
    { href: "/manual", label: dictionary.shell.manual, icon: BookOpenText },
    { href: "/master-data", label: dictionary.shell.masterData, icon: Database },
  ];

  return (
    <main className="min-h-screen px-3 py-3 text-foreground sm:px-5 lg:px-7">
      <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-[248px_1fr]">
        <aside className="rounded-2xl border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="flex h-full flex-col gap-6">
            <Link href={localizePath("/offers")} className="group flex items-center gap-3 rounded-xl p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                <Calculator className="size-5" />
              </div>
              <div>
                <div className="font-semibold tracking-tight">Busduct MTO</div>
                <div className="text-xs text-sidebar-foreground/60">{dictionary.shell.pricingWorkspace}</div>
              </div>
            </Link>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    nativeButton={false}
                    variant="ghost"
                    className="h-10 justify-start rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    render={<Link href={localizePath(item.href)} />}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-sidebar-border bg-white/5 p-4">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-sidebar-foreground/50">
                {dictionary.shell.workspace}
              </div>
              <div className="mt-3 space-y-2 text-sm text-sidebar-foreground/75">
                <div className="flex justify-between gap-3"><span>{dictionary.shell.storage}</span><span>SQLite</span></div>
                <div className="flex justify-between gap-3"><span>{dictionary.shell.pricing}</span><span>MTO Value</span></div>
                <div className="flex justify-between gap-3"><span>{dictionary.shell.output}</span><span>{dictionary.shell.auditView}</span></div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {dictionary.shell.offerEngineering}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {dictionary.shell.heroTitle}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {dictionary.shell.heroDescription}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <LanguageSwitcher />
                <Button nativeButton={false} size="lg" className="rounded-xl" render={<Link href={localizePath("/offers/new")} />}>
                  <FilePlus2 />
                  {dictionary.shell.newOffer}
                </Button>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
