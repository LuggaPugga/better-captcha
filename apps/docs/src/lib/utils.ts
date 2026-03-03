import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import HomePageMetaEN from "@/../content/docs/en/home.meta.json" with { type: "json" };
import HomePageMetaCN from "@/../content/docs/cn/home.meta.json" with { type: "json" };

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function getHomeMeta(lang: string) {
	const HomePageMeta = {
		en: HomePageMetaEN,
		cn: HomePageMetaCN,
	}

	return HomePageMeta[lang as keyof typeof HomePageMeta] || HomePageMetaEN;
}