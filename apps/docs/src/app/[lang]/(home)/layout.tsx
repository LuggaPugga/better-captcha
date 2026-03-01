import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ params, children }: { params: { lang: string }, children: ReactNode }) {
	return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
}
