import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

const { rewrite: rewriteLLM } = rewritePath("/docs/*path", "/llms.mdx/*path");

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // You may need to adjust it to ignore static assets in `/public` folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function proxy(request: NextRequest) {
	if (isMarkdownPreferred(request)) {
		const result = rewriteLLM(request.nextUrl.pathname);

		if (result) {
			return NextResponse.rewrite(new URL(result, request.nextUrl));
		}
	}

	return NextResponse.next();
}

export default createI18nMiddleware(i18n);

