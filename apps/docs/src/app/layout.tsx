import "@/app/global.css";
import Analytics from "@/components/analytics";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
	subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<Analytics />
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
