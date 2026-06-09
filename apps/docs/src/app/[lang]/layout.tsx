import "@/app/global.css";
import Analytics from "@/components/analytics";
import { RootProvider } from "fumadocs-ui/provider/next";
import { i18nProvider } from 'fumadocs-ui/i18n';
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { translations } from '@/lib/layout.shared';

const inter = Inter({
  subsets: ["latin"],
});

export default async function Layout({ params, children }: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const lang = (await params).lang;
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Analytics />
        <RootProvider i18n={i18nProvider(translations, lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}

