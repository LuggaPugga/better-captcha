<script lang="ts">
	import type { ProsopoHandle, RenderParameters } from "@better-captcha/svelte/provider/prosopo";
	import Prosopo from "@better-captcha/svelte/provider/prosopo";
	import { writable } from "svelte/store";

	let captchaRef: Prosopo | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);

	let options = $state<Omit<RenderParameters, "siteKey">>({
		theme: "light",
	});

	function onReady(handle: ProsopoHandle) {
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

	async function handleRender() {
		await captchaRef?.showCaptcha();
	}

	function handleGetResponse() {
		const captchaResponse = captchaRef?.getResponse() || "No response";
		response.set(captchaResponse);
	}

	function handleChangeTheme() {
		const themes = ["light", "dark"] as const;
		const currentTheme = options.theme || "light";
		const currentIndex = themes.indexOf(currentTheme === "auto" ? "light" : currentTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		options = { ...options, theme: themes[nextIndex] };
	}
</script>

<div>
	<h3>Prosopo Test</h3>
	<Prosopo bind:this={captchaRef} sitekey="5Hxxxxxxxxxxxxxxxxxxx_xxx" {options} onready={onReady} onerror={onError} />
	<div style="margin-top: 10px">
		<button type="button" onclick={handleDestroy}>Destroy</button>
		<button type="button" onclick={handleReset}>Reset</button>
		<button type="button" onclick={handleExecute}>Execute</button>
		<button type="button" onclick={handleRender}>Render</button>
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
