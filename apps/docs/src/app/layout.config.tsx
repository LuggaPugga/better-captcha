import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from '@/lib/i18n';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
	i18n,
	githubUrl: "https://github.com/LuggaPugga/better-captcha",
	nav: {
		title: (
			<>
				<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
					<title>Logo</title>
					<circle cx={12} cy={12} r={12} fill="currentColor" />
				</svg>
				Better Captcha
			</>
		),
	},
};
