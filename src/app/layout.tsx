import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/client";
import { getDirection } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary();

  return (
    <html lang={locale} dir={getDirection(locale)} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <TooltipProvider>
          {children}
        </TooltipProvider>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
