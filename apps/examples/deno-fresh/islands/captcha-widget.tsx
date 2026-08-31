import { Turnstile, type TurnstileHandle } from "@better-captcha/preact/provider/turnstile";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

interface CaptchaWidgetProps {
	sitekey?: string;
}

function CaptchaPlaceholder() {
	return (
		<div class="w-full max-w-md mx-auto">
			<div class="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
				<h2 class="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Security Verification</h2>
				<p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
					Complete the challenge below to verify you are human.
				</p>
				<div class="h-20 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
					<span class="text-sm text-slate-500 dark:text-slate-400">Loading...</span>
				</div>
			</div>
		</div>
	);
}

function CaptchaWidgetClient(props: CaptchaWidgetProps) {
	const captchaRef = useRef<TurnstileHandle>(null);
	const [token, setToken] = useState<string>("");
	const [status, setStatus] = useState<"idle" | "solving" | "solved" | "error">("idle");

	const handleSolve = useCallback((newToken: string) => {
		setToken(newToken);
		setStatus("solved");
	}, []);

	const handleError = useCallback((error: Error | string) => {
		console.error("Captcha error:", error);
		setStatus("error");
	}, []);

	const handleReset = useCallback(() => {
		captchaRef.current?.reset();
		setToken("");
		setStatus("idle");
	}, []);

	const sitekey = props.sitekey || "1x00000000000000000000AA";

	return (
		<div class="w-full max-w-md mx-auto">
			<div class="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
				<h2 class="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Security Verification</h2>

				<p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
					Complete the challenge below to verify you are human.
				</p>

				<div class="mb-4 flex justify-center">
					<Turnstile
						ref={captchaRef}
						sitekey={sitekey}
						options={{ theme: "auto" }}
						onSolve={handleSolve}
						onError={handleError}
					/>
				</div>

				{status === "solved" && (
					<div class="mt-4 p-3 border border-green-300 dark:border-green-700 rounded text-sm text-green-700 dark:text-green-300">
						Verification complete!
					</div>
				)}

				{status === "error" && (
					<div class="mt-4 p-3 border border-red-300 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
						Verification failed. Please try again.
					</div>
				)}

				{status !== "idle" && (
					<div class="mt-4">
						<button
							type="button"
							onClick={handleReset}
							class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
						>
							Reset
						</button>
					</div>
				)}

				{token && (
					<div class="mt-4">
						<span class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
							Token (for server verification)
						</span>
						<div class="p-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
							{token}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function CaptchaWidget(props: CaptchaWidgetProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <CaptchaPlaceholder />;
	}

	return <CaptchaWidgetClient {...props} />;
}
