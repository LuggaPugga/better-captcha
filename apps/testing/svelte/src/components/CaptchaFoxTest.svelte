<script lang="ts">
	import CaptchaFox from "@better-captcha/svelte/provider/captcha-fox";
	import type { CaptchaFoxHandle, RenderParameters } from "@better-captcha/svelte/provider/captcha-fox";
	import { writable } from "svelte/store";

	let captchaRef: CaptchaFox | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);

	let options = $state<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		mode: "inline",
	});

	function onReady(handle: CaptchaFoxHandle) {
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
		const themes = ["light", "dark"] as const;
		const currentTheme = options.theme;
		const normalizedTheme = !currentTheme || typeof currentTheme !== "string" || currentTheme === "auto" 
			? "light" 
			: currentTheme;
		const currentIndex = themes.indexOf(normalizedTheme as "light" | "dark");
		const nextIndex = (currentIndex + 1) % themes.length;
		options = { ...options, theme: themes[nextIndex] };
	}
</script>

<div>
	<h3>Captcha Fox Test</h3>
	<CaptchaFox bind:this={captchaRef} sitekey="1234567890abcdefghijklmn" {options} onready={onReady} onerror={onError} />
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
