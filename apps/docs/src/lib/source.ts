import { SiLit, SiNpm, SiPreact, SiQwik, SiReact, SiSolid, SiSvelte, SiVuedotjs } from "@icons-pack/react-simple-icons";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { docs } from 'fumadocs-mdx:collections/server';
import { i18n } from '@/lib/i18n';

export const source = loader({
	i18n,
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon: string | undefined) {
		if (!icon) return;
		if (icon === "npm") return createElement(SiNpm);
		if (icon === "react") return createElement(SiReact);
		if (icon === "vue") return createElement(SiVuedotjs);
		if (icon === "svelte") return createElement(SiSvelte);
		if (icon === "solidjs") return createElement(SiSolid);
		if (icon === "qwik") return createElement(SiQwik);
		if (icon === "preact") return createElement(SiPreact);

		if (icon === "lit") return createElement(SiLit);
		if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
	},
});
