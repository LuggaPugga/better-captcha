<script lang="ts">
	import type { PrivateCaptchaHandle, RenderParameters } from "@better-captcha/svelte/provider/private-captcha";
	import PrivateCaptcha from "@better-captcha/svelte/provider/private-captcha";
	import { writable } from "svelte/store";

	let captchaRef: PrivateCaptcha | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);

	let options = $state<Omit<RenderParameters, "sitekey">>({
		theme: "light",
	});

	function onReady(handle: PrivateCaptchaHandle) {
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
		await captchaRef?.render();
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
	<h3>Private Captcha Test</h3>
	<form>
		<PrivateCaptcha
			bind:this={captchaRef}
			sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee"
			{options}
			onready={onReady}
			onerror={onError}
		/>
	</form>
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
