import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { AutoTypeTable } from "fumadocs-typescript/ui";
import { createGenerator } from "fumadocs-typescript";

const generator = createGenerator();

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		AutoTypeTable: (props) => (
			<AutoTypeTable {...props} generator={generator} />
		),
		...components,
	};
}
