import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "React Captcha + Better Auth Example",
	description: "React Captcha + Better Auth Example",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
			</ThemeProvider>
		</html>
	);
}
