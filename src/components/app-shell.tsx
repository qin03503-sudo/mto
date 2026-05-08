"use client";

import {
  Calculator,
  Database,
  FilePlus2,
  LayoutDashboard,
  BarChart3,
  BookOpenText,
  Inbox,
  AlertOctagon,
  Send,
  Blocks,
  FileStack,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n, useLocalizedPath } from "@/i18n/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dictionary, locale } = useI18n();
  const localizePath = useLocalizedPath();
  const pathname = usePathname();

  const navItems = [
    { href: "/offers", label: dictionary.shell.offers, icon: LayoutDashboard },
    { href: "/offers/new", label: dictionary.shell.newOffer, icon: FilePlus2 },
    { href: "/scopes", label: "Scopes", icon: Blocks },
    { href: "/parts", label: "Parts", icon: FileStack },
    { href: "/dashboard", label: dictionary.shell.dashboard, icon: BarChart3 },
    { href: "/offers/inbox", label: dictionary.shell.managementInbox, icon: Inbox },
    { href: "/offers/stale", label: dictionary.shell.managementStale, icon: AlertOctagon },
    { href: "/offers/ready", label: dictionary.shell.managementReady, icon: Send },
    { href: "/reports", label: dictionary.shell.reports, icon: BarChart3 },
    { href: "/manual", label: dictionary.shell.manual, icon: BookOpenText },
    { href: "/master-data", label: dictionary.shell.masterData, icon: Database },
  ];

  const normalizedPath = pathname.replace(`/${locale}`, "") || "/";
  const currentNavItem =
    navItems.find((item) => normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)) ?? navItems[0];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href={localizePath("/offers")} className="flex items-center gap-3 group">
            <div className="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground size-8">
              <Calculator className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-sidebar-foreground">Busduct MTO</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">{dictionary.shell.pricingWorkspace}</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                        <Link href={localizePath(item.href)} className="flex items-center gap-2 w-full">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          <div className="font-medium uppercase tracking-widest mb-2 opacity-50">{dictionary.shell.workspace}</div>
          <div className="space-y-1">
            <div className="flex justify-between"><span>{dictionary.shell.storage}</span><span>SQLite</span></div>
            <div className="flex justify-between"><span>{dictionary.shell.pricing}</span><span>MTO Value</span></div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col flex-1 w-full min-h-screen overflow-hidden">
        <header className="flex items-center h-16 gap-4 px-4 bg-background border-b md:px-6 shrink-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />

          <div className="flex-1">
            <div className="text-sm font-medium text-muted-foreground">{currentNavItem.label}</div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {/* Adding 'asChild' to Shadcn button to properly wrap Link and maintain standard prop usage */}
            <Button size="sm" className="hidden sm:flex" nativeButton={false} render={<Link href={localizePath("/offers/new")} />}>
              <FilePlus2 className="w-4 h-4 mr-2" />
              {dictionary.shell.newOffer}
            </Button>
          </div>
        </header>

        {/* Main Content Area - adding 20% breathing space with p-6 or p-8 instead of generic padding */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto bg-muted/20">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{currentNavItem.label}</h1>
              <p className="text-muted-foreground max-w-2xl text-lg">{dictionary.shell.heroDescription}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
