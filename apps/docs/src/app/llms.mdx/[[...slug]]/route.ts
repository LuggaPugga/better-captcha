import { notFound } from "next/navigation";
import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET(req: Request, { params }: RouteContext<"/llms.mdx/[[...slug]]">) {
	const { slug } = await params;
	const lang = new URL(req.url).searchParams.get("lang") ?? undefined;
	const page = source.getPage(slug, lang);
	if (!page) notFound();

	return new Response(await getLLMText(page), {
		headers: {
			"Content-Type": "text/markdown",
		},
	});
}

export function generateStaticParams() {
	return source.generateParams();
}
