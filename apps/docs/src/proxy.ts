import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

const { rewrite: rewriteLLM } = rewritePath("/docs/*path", "/llms.mdx/*path");
const { rewrite: rewriteLocalizedLLM } = rewritePath("/:lang/docs/*path", "/llms.mdx/*path");
const i18nMiddleware = createI18nMiddleware(i18n);

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // You may need to adjust it to ignore static assets in `/public` folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function proxy(request: NextRequest, event: NextFetchEvent) {
	if (isMarkdownPreferred(request)) {
		const pathname = request.nextUrl.pathname;
		const result = rewriteLLM(pathname) ?? rewriteLocalizedLLM(pathname);

		if (result) {
			return NextResponse.rewrite(new URL(result, request.nextUrl));
		}
	}

	return i18nMiddleware(request, event);
}

