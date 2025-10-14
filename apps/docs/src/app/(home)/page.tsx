import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col max-w-6xl mx-auto">
			<section className="pt-16 md:pt-24 pb-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<div className="text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
							<span className="inline-block h-2 w-2 rounded-full bg-foreground" />
							<span>Framework agnostic</span>
							<span className="opacity-60">One API. Any CAPTCHA.</span>
						</div>
						<h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
							<span>Better Captcha</span>
						</h1>
						<p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
							A single, type‑safe API for CAPTCHA providers that works across frameworks. React and Solid today. Vue and
							Svelte coming soon.
						</p>
						<div className="mt-8 flex items-center gap-3">
							<Link
								href="/docs"
								className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium border-border hover:bg-muted transition-colors"
							>
								Get Started
							</Link>
							<Link
								href="/docs/overview"
								className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Learn more
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="py-6 border-t border-b border-border">
				<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 items-center gap-4 text-sm">
					<li className="justify-self-center">
						<div className="text-xl font-semibold">12,340</div>
						<div className="text-muted-foreground">npm downloads</div>
					</li>
					<li className="justify-self-center">
						<div className="text-xl font-semibold">1,247</div>
						<div className="text-muted-foreground">GitHub stars</div>
					</li>
					<li className="justify-self-center">
						<div className="text-xl font-semibold">7</div>
						<div className="text-muted-foreground">Providers</div>
					</li>
					<li className="justify-self-center">
						<div className="text-xl font-semibold">2</div>
						<div className="text-muted-foreground">Frameworks</div>
					</li>
					<li className="justify-self-center">
						<div className="text-xl font-semibold">~2.3kB</div>
						<div className="text-muted-foreground">Runtime footprint</div>
					</li>
					<li className="justify-self-center">
						<div className="text-xl font-semibold">100%</div>
						<div className="text-muted-foreground">Type coverage</div>
					</li>
				</ul>
			</section>

			<section className="py-6">
				<h2 className="text-xl font-semibold mb-4">Use it in your framework</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
					<div className="p-4 bg-card border border-border rounded-lg">
						<div className="text-sm text-muted-foreground">Available</div>
						<div className="mt-1 font-medium">React</div>
					</div>
					<div className="p-4 bg-card border border-border rounded-lg">
						<div className="text-sm text-muted-foreground">Available</div>
						<div className="mt-1 font-medium">Solid</div>
					</div>
					<div className="p-4 bg-card border border-border rounded-lg opacity-70">
						<div className="text-sm text-muted-foreground">Coming soon</div>
						<div className="mt-1 font-medium">Vue</div>
					</div>
					<div className="p-4 bg-card border border-border rounded-lg opacity-70">
						<div className="text-sm text-muted-foreground">Coming soon</div>
						<div className="mt-1 font-medium">Svelte</div>
					</div>
				</div>
			</section>

			<section className="py-6">
				<h2 className="text-xl font-semibold mb-4">Features</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4 flex flex-col gap-4">
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Unified API</h3>
							<p className="text-sm text-muted-foreground">
								Swap providers without changing your UI or business logic.
							</p>
						</div>
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Lifecycle-driven script loading</h3>
							<p className="text-sm text-muted-foreground">Only loads vendor scripts when needed for faster pages.</p>
						</div>
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Auto Theme</h3>
							<p className="text-sm text-muted-foreground">Adapts to your app theme even if the provider does not.</p>
						</div>
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Fast and lightweight</h3>
							<p className="text-sm text-muted-foreground">Zero extra dependencies. Minimal runtime footprint.</p>
						</div>
					</div>
					<div className="relative bg-card border border-border rounded-lg overflow-hidden min-h-[280px]"></div>
				</div>
			</section>
		</main>
	);
}
