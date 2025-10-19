import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";
import { createGenerator, remarkAutoTypeTable } from "fumadocs-typescript";

const generator = createGenerator();

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
	docs: {
		schema: frontmatterSchema,
		postprocess: {
			includeProcessedMarkdown: true,
		},
	},
	meta: {
		schema: metaSchema,
	},
});

export default defineConfig({
	mdxOptions: {
		remarkNpmOptions: {
			persist: {
				id: "npm-install",
			},
		},
		remarkPlugins: [[remarkAutoTypeTable, { generator }]],
	},
});
