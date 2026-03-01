import { isMarkdownPreferred } from "fumadocs-core/negotiation";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

const i18nMiddleware = createI18nMiddleware(i18n);
type Locale = (typeof i18n.languages)[number];
type RewriteTarget = {
	pathname: string;
	locale?: Locale;
};

function isSupportedLocale(value: string): value is Locale {
	return i18n.languages.includes(value as Locale);
}

function buildLlmPathname(slug?: string) {
	return slug ? `/llms.mdx/${slug}` : '/llms.mdx';
}

function getRewriteTarget(pathname: string): RewriteTarget | null {
	const normalizedPathname = pathname.endsWith('.mdx') ? pathname.slice(0, -4) : pathname;
	const defaultMatch = normalizedPathname.match(/^\/docs(?:\/(.*))?$/);
	if (defaultMatch) {
		return {
			pathname: buildLlmPathname(defaultMatch[1]),
		};
	}

	const localizedMatch = normalizedPathname.match(/^\/([^/]+)\/docs(?:\/(.*))?$/);
	if (!localizedMatch) return null;

	const [_, locale, slug] = localizedMatch;
	if (!isSupportedLocale(locale)) return null;

	return {
		pathname: buildLlmPathname(slug),
		locale,
	};
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // You may need to adjust it to ignore static assets in `/public` folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function proxy(request: NextRequest, event: NextFetchEvent) {
	const pathname = request.nextUrl.pathname;
	const isMdxRequest = pathname.endsWith('.mdx');
	const shouldRewriteLLM = isMarkdownPreferred(request) || isMdxRequest;

	if (shouldRewriteLLM) {
		const rewriteTarget = getRewriteTarget(pathname);
		if (rewriteTarget) {
			const rewrittenUrl = new URL(rewriteTarget.pathname, request.nextUrl);
			if (rewriteTarget.locale) {
				rewrittenUrl.searchParams.set('lang', rewriteTarget.locale);
			}
			return NextResponse.rewrite(rewrittenUrl);
		}
	}

	return i18nMiddleware(request, event);
}

