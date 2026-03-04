import { createFromSource } from "fumadocs-core/search/server";
import { createTokenizer as createMandarinTokenizer } from "@orama/tokenizers/mandarin";
import { source } from "@/lib/source";

export const { GET } = createFromSource(source, {
	localeMap: {
		en: "english",
		cn: {
			tokenizer: createMandarinTokenizer(),
		},
	},
});
