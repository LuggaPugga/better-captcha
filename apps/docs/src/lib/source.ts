import { SiLit, SiNpm, SiQwik, SiReact, SiSolid, SiSvelte, SiVuedotjs } from "@icons-pack/react-simple-icons";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { docs } from "fumadocs-mdx:collections/index";

export const source = loader({
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

		if (icon === "lit") return createElement(SiLit);
		if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
	},
});
