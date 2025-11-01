<script lang="ts">
	import type { ReCaptchaHandle, RenderParameters } from "@better-captcha/svelte/provider/recaptcha";
	import ReCaptcha from "@better-captcha/svelte/provider/recaptcha";
	import { writable } from "svelte/store";

	let captchaRef: ReCaptcha | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);
	const solved = writable<boolean>(false);

	let options = $state<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});

	function onReady(handle: ReCaptchaHandle) {
		console.log("Captcha ready!", handle);
	}

	function onError(err: Error) {
		error.set(err);
		console.error("Captcha error:", err);
	}

	function onSolve(token: string) {
		solved.set(true);
		console.log("Captcha solved with token:", token);
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
		const currentIndex = themes.indexOf(options.theme || "light");
		const nextIndex = (currentIndex + 1) % themes.length;
		options = { ...options, theme: themes[nextIndex] };
	}
</script>

<div>
	<h3>reCAPTCHA Test</h3>
	<ReCaptcha
		bind:this={captchaRef}
		sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
		{options}
		onready={onReady}
		onerror={onError}
		onSolve={onSolve}
	/>
	{#if $solved}
		<p id="captcha-solved">Captcha Solved!</p>
	{/if}
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
