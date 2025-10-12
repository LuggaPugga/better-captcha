import { randomUUID } from "node:crypto";
import Link from "next/link";
import { FriendlyCaptcha } from "react-captcha/provider/friendly-captcha";
import { HCaptcha } from "react-captcha/provider/hcaptcha";
import { PrivateCaptcha } from "react-captcha/provider/private-captcha";
import { ReCaptcha } from "react-captcha/provider/recaptcha";
import { Turnstile } from "react-captcha/provider/turnstile";

const captchas = [
	<FriendlyCaptcha sitekey="da" key={randomUUID()} options={{ theme: "dark" }} />,
	<ReCaptcha sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" key={randomUUID()} options={{ theme: "dark" }} />,
	<HCaptcha sitekey="10000000-ffff-ffff-ffff-000000000001" key={randomUUID()} options={{ theme: "dark" }} />,
	<Turnstile sitekey="1x00000000000000000000AA" key={randomUUID()} options={{ theme: "dark" }} />,
	<form key={randomUUID()}>
		<PrivateCaptcha sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee" options={{ theme: "dark" }} />
	</form>,
];

export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col max-w-6xl mx-auto">
			{/* Hero */}
			<section className="pt-16 md:pt-24 pb-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<div className="text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
							<span className="inline-block h-2 w-2 rounded-full bg-foreground" />
							<span>New</span>
							<span className="opacity-60">Introducing React Captcha</span>
						</div>
						<h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
							<span>React Captcha</span>
						</h1>
						<p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
							Create powerful captcha integrations with a single React API. Type‑safe, minimal, and designed for modern
							app workflows.
						</p>
						<div className="mt-8 flex items-center gap-3">
							<Link
								href="/docs"
								className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium border-border hover:bg-muted transition-colors"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="py-6 border-t border-b border-border">
				<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 items-center gap-4 text-muted-foreground text-sm">
					<li className="justify-self-center opacity-70">Turnstile</li>
					<li className="justify-self-center opacity-70">HCaptcha</li>
					<li className="justify-self-center opacity-70">ReCaptcha</li>
					<li className="justify-self-center opacity-70">Friendly Captcha</li>
					<li className="justify-self-center opacity-70">Private Captcha</li>
					<li className="justify-self-center opacity-70">And more</li>
				</ul>
			</section>

			<section className="py-6">
				<h2 className="text-xl font-semibold mb-4">Features</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4 flex flex-col gap-4">
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Layoutshift Prevention</h3>
							<p className="text-sm text-muted-foreground">
								Prevents layout shifts by reserving space for the captcha widget before it loads.
							</p>
						</div>
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Auto Theme</h3>
							<p className="text-sm text-muted-foreground">
								Automatically adapts to your app's theme even on providers that don't support it natively.
							</p>
						</div>
						<div className="p-4 bg-card border border-border rounded-lg flex-1">
							<h3 className="text-lg font-semibold mb-2">Fast and lightweight</h3>
							<p className="text-sm text-muted-foreground">Built without any extra dependencies.</p>
						</div>
					</div>
					<div className="bg-card border border-border rounded-lg"></div>
				</div>
			</section>
		</main>
	);
}
