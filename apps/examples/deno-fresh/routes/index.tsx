import { Head } from "fresh/runtime";
import CaptchaWidget from "../islands/captcha-widget.tsx";

export default function Home() {
	return (
		<div class="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
			<Head>
				<title>Better Captcha - Deno Fresh Demo</title>
				<meta name="description" content="Better Captcha demo with Deno Fresh" />
			</Head>

			<header class="flex-shrink-0 px-4 py-6">
				<div class="max-w-xl mx-auto flex items-center justify-between">
					<h1 class="text-lg font-semibold text-slate-900 dark:text-white">Better Captcha</h1>
					<nav class="flex gap-4 text-sm">
						<a
							href="https://better-captcha.dev"
							target="_blank"
							rel="noopener noreferrer"
							class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
						>
							Docs
						</a>
						<a
							href="https://github.com/LuggaPugga/better-captcha"
							target="_blank"
							rel="noopener noreferrer"
							class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
						>
							GitHub
						</a>
					</nav>
				</div>
			</header>

			<main class="flex-1 max-w-xl mx-auto w-full px-4 pb-16">
				<div class="mb-10">
					<h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-1">Deno Fresh Demo</h2>
					<p class="text-slate-600 dark:text-slate-400 text-sm">Privacy-first CAPTCHA with Cloudflare Turnstile.</p>
				</div>

				<section class="mb-10">
					<CaptchaWidget />
				</section>

				<section class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
					<h3 class="text-sm font-medium text-slate-900 dark:text-white mb-3">Quick Start</h3>
					<pre class="text-sm text-slate-600 dark:text-slate-400 overflow-x-auto font-mono">
						<code>{`import { Turnstile } from "@better-captcha/preact/provider/turnstile";

<Turnstile
  sitekey="1x00000000000000000000AA"
  options={{ theme: "auto" }}
  onSolve={(token) => console.log(token)}
/>`}</code>
					</pre>
				</section>
			</main>
		</div>
	);
}
