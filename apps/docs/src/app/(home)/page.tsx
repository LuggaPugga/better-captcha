import Link from "next/link";
import { getGithubStars, getNpmDownloads } from "@/lib/api";

export default async function HomePage() {
	const [githubStars, npmDownloads] = await Promise.all([getGithubStars(), getNpmDownloads()]);

	return (
		<main className="flex flex-1 flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<section className="pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
					<div className="text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs sm:text-sm text-muted-foreground">
							<span className="inline-block h-2 w-2 rounded-full bg-foreground" />
							<span>Framework agnostic</span>
							<span className="opacity-60 hidden sm:inline">One API. Any CAPTCHA.</span>
						</div>
						<h1 className="mt-4 text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight">
							<span>Better Captcha</span>
						</h1>
						<p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
							A single, type‑safe API for CAPTCHA providers that works across frameworks. React and Solid today. Vue and
							Svelte coming soon.
						</p>
						<div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
							<Link
								href="/docs"
								className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium border-border hover:bg-muted transition-colors w-full sm:w-auto"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="py-6 sm:py-8 border-t border-b border-border">
				<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 items-center gap-4 sm:gap-6 text-center">
					<div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
						<div className="text-2xl sm:text-3xl font-bold text-primary">{npmDownloads}</div>
						<div className="text-xs sm:text-sm text-muted-foreground leading-tight">npm downloads this week</div>
					</div>
					<div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
						<div className="text-2xl sm:text-3xl font-bold text-primary">{githubStars}</div>
						<div className="text-xs sm:text-sm text-muted-foreground">GitHub stars</div>
					</div>
					<div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
						<div className="text-2xl sm:text-3xl font-bold text-primary">7</div>
						<div className="text-xs sm:text-sm text-muted-foreground">Providers</div>
					</div>
					<div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
						<div className="text-2xl sm:text-3xl font-bold text-primary">3</div>
						<div className="text-xs sm:text-sm text-muted-foreground">Frameworks</div>
					</div>
				</div>
			</section>

			<section className="py-6 sm:py-8">
				<h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Use it in your framework</h2>
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
					<div className="p-3 sm:p-4 bg-card border border-border rounded-lg">
						<div className="text-xs sm:text-sm text-muted-foreground">Available</div>
						<div className="mt-1 font-medium text-sm sm:text-base">React</div>
					</div>
					<div className="p-3 sm:p-4 bg-card border border-border rounded-lg">
						<div className="text-xs sm:text-sm text-muted-foreground">Available</div>
						<div className="mt-1 font-medium text-sm sm:text-base">Solid</div>
					</div>
					<div className="p-3 sm:p-4 bg-card border border-border rounded-lg">
						<div className="text-xs sm:text-sm text-muted-foreground">Available</div>
						<div className="mt-1 font-medium text-sm sm:text-base">Vue</div>
					</div>
					<div className="p-3 sm:p-4 bg-card border border-border rounded-lg opacity-70">
						<div className="text-xs sm:text-sm text-muted-foreground">Coming soon</div>
						<div className="mt-1 font-medium text-sm sm:text-base">Svelte</div>
					</div>
				</div>
			</section>

			<section className="py-6 sm:py-8">
				<h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Features</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					<div className="space-y-3 sm:space-y-4 flex flex-col gap-3 sm:gap-4">
						<div className="p-3 sm:p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Unified API</h3>
							<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
								Swap providers without changing your UI or business logic.
							</p>
						</div>
						<div className="p-3 sm:p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Lifecycle-driven script loading</h3>
							<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
								Only loads vendor scripts when needed for faster pages.
							</p>
						</div>
						<div className="p-3 sm:p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Auto Theme</h3>
							<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
								Adapts to your app theme even if the provider does not.
							</p>
						</div>
						<div className="p-3 sm:p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Fast and lightweight</h3>
							<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
								Zero extra dependencies. Minimal runtime footprint.
							</p>
						</div>
					</div>
					<div className="relative bg-card border border-border rounded-lg overflow-hidden min-h-[200px] sm:min-h-[280px]"></div>
				</div>
			</section>
		</main>
	);
}
