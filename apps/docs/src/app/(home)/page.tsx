import { SiLit, SiQwik, SiReact, SiSolid, SiSvelte, SiVuedotjs } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { getGithubStars, getNpmDownloads } from "@/lib/api";
import { Code2, Shield, Zap, Palette, RotateCcw, Terminal } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
	const [githubStars, npmDownloads] = await Promise.all([getGithubStars(), getNpmDownloads()]);

	return (
		<main className="flex flex-1 flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<section className="pt-20 pb-16 text-center">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-secondary text-xs text-muted-foreground mb-6">
					<span className="h-1.5 w-1.5 rounded-full bg-primary" />
					Framework agnostic CAPTCHA library
						</div>
				<h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
					Better Captcha
						</h1>
				<p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
					Swap CAPTCHA providers without changing your code. Works with React, Solid, Vue, Svelte, Qwik, and Lit.
						</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
							<Link
								href="/docs"
						className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								Get Started
							</Link>
					<Link
						href="https://github.com/LuggaPugga/better-captcha"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
					>
						GitHub
					</Link>
				</div>
			</section>

			<section className="py-12 border-y border-border bg-muted/30">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					<div className="p-4 rounded-lg">
						<div className="text-3xl font-bold text-primary mb-1">{npmDownloads}</div>
						<div className="text-sm text-muted-foreground">npm downloads/week</div>
					</div>
					<div className="p-4 rounded-lg">
						<div className="text-3xl font-bold text-primary mb-1">{githubStars}</div>
						<div className="text-sm text-muted-foreground">GitHub stars</div>
					</div>
					<div className="p-4 rounded-lg">
						<div className="text-3xl font-bold text-primary mb-1">7</div>
						<div className="text-sm text-muted-foreground">CAPTCHA Providers</div>
					</div>
					<div className="p-4 rounded-lg">
						<div className="text-3xl font-bold text-primary mb-1">6</div>
						<div className="text-sm text-muted-foreground">Frameworks</div>
					</div>
				</div>
			</section>

			<section className="py-16">
				<h2 className="text-2xl font-semibold mb-3 text-center">Supported Frameworks</h2>
				<p className="text-sm text-muted-foreground mb-8 text-center max-w-xl mx-auto">
					Choose your favorite framework. Same API, same features, zero compromises.
				</p>
				<div className="grid grid-cols-3 md:grid-cols-6 gap-4">
					<Link
						href="/docs/frameworks/react"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiReact className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">React</span>
					</Link>
					<Link
						href="/docs/frameworks/solidjs"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiSolid className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">Solid</span>
					</Link>
					<Link
						href="/docs/frameworks/vue"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiVuedotjs className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">Vue</span>
					</Link>
					<Link
						href="/docs/frameworks/svelte"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiSvelte className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">Svelte</span>
					</Link>
					<Link
						href="/docs/frameworks/qwik"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiQwik className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">Qwik</span>
					</Link>
					<Link
						href="/docs/frameworks/lit"
						className="flex flex-col items-center p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group"
					>
						<SiLit className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-medium">Lit</span>
					</Link>
				</div>
			</section>

			<section className="py-16">
				<h2 className="text-2xl font-semibold mb-3 text-center">Features</h2>
				<p className="text-sm text-muted-foreground mb-10 text-center max-w-xl mx-auto">
					Everything you need to integrate CAPTCHA seamlessly into your application
				</p>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<Code2 className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Unified API</h3>
						<p className="text-sm text-muted-foreground">
							One consistent interface across all CAPTCHA providers. Swap providers without changing your code.
						</p>
					</div>
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<Zap className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Smart Loading</h3>
						<p className="text-sm text-muted-foreground">
							Vendor scripts load only when needed. Better performance and smaller bundle sizes.
						</p>
					</div>
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<Palette className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Auto Theme</h3>
						<p className="text-sm text-muted-foreground">
							Automatically adapts to your app's theme, even when providers don't support it natively.
						</p>
					</div>
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<Shield className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Type Safe</h3>
						<p className="text-sm text-muted-foreground">
							Full TypeScript support with zero extra dependencies. Lightweight and fast.
						</p>
					</div>
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<RotateCcw className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Programmatic Control</h3>
						<p className="text-sm text-muted-foreground">
							Execute, reset, and manage CAPTCHA widgets programmatically with a simple handle API.
						</p>
					</div>
					<div className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group">
						<div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
							<Terminal className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold mb-2">Framework Agnostic</h3>
						<p className="text-sm text-muted-foreground">
							Works with React, Solid, Vue, Svelte, Qwik, and Lit. Same features everywhere.
						</p>
					</div>
				</div>
			</section>

			<section className="py-16 border-t border-border">
				<div className="max-w-2xl mx-auto text-center">
					<h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
					<p className="text-muted-foreground mb-8">
						Choose your framework and start protecting your forms in minutes.
					</p>
					<Link
						href="/docs"
						className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						View Documentation
					</Link>
				</div>
			</section>
		</main>
	);
}
