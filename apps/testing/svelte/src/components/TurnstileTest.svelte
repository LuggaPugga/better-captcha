<script lang="ts">
	import type { RenderParameters, TurnstileHandle } from "@better-captcha/svelte/provider/turnstile";
	import Turnstile from "@better-captcha/svelte/provider/turnstile";
	import { writable } from "svelte/store";

	let captchaRef: Turnstile | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);

	let options = $state<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});

	function onReady(handle: TurnstileHandle) {
		console.log("Captcha ready!", handle);
	}

	function onError(err: Error) {
		error.set(err);
		console.error("Captcha error:", err);
	}

	function handleDestroy() {
		captchaRef?.destroy();
	}

	function handleReset() {
		captchaRef?.reset();
		response.set(null);
	}

	async function handleExecute() {
		await captchaRef?.execute();
	}

	function handleGetResponse() {
		const captchaResponse = captchaRef?.getResponse() || "No response";
		response.set(captchaResponse);
	}

	function handleChangeTheme() {
		const themes = ["light", "dark", "auto"] as const;
		const currentIndex = themes.indexOf(options.theme || "auto");
		const nextIndex = (currentIndex + 1) % themes.length;
		options = { ...options, theme: themes[nextIndex] };
	}
</script>

<div>
	<h3>Turnstile Test</h3>
	<Turnstile bind:this={captchaRef} sitekey="1x00000000000000000000AA" {options} onready={onReady} onerror={onError} />
	<div style="margin-top: 10px">
		<button type="button" onclick={handleDestroy}>Destroy</button>
		<button type="button" onclick={handleReset}>Reset</button>
		<button type="button" onclick={handleExecute}>Execute</button>
		<button type="button" onclick={handleGetResponse}>Get Response</button>
		<button type="button" onclick={handleChangeTheme}>Change Theme</button>
	</div>
	{#if $response}
		<p id="captcha-response">{$response}</p>
	{/if}
	{#if $error}
		<p style="color: red">Error: {$error.message}</p>
	{/if}
</div>
