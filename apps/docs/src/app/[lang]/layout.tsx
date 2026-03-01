import "@/app/global.css";
import Analytics from "@/components/analytics";
import { RootProvider } from "fumadocs-ui/provider/next";
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { i18n } from '@/lib/i18n';

const inter = Inter({
	subsets: ["latin"],
});

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: 'English',
    },
    cn: {
      displayName: 'Chinese',
      search: '搜索文档',
    },
  },
});

export default async function Layout({ params, children }: { params: Promise<{ lang: string }>; children: ReactNode }) {
	const lang = (await params).lang;
	return (
		<html lang={lang} className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<Analytics />
				<RootProvider i18n={provider(lang)}>{children}</RootProvider>
			</body>
		</html>
	);
}

