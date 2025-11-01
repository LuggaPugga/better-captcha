<script lang="ts">
	import type { FriendlyCaptchaHandle, RenderParameters } from "@better-captcha/svelte/provider/friendly-captcha";
	import FriendlyCaptcha from "@better-captcha/svelte/provider/friendly-captcha";
	import { writable } from "svelte/store";

	let captchaRef: FriendlyCaptcha | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);
	const solved = writable<boolean>(false);

	let theme = $state<"light" | "dark">("light");

	const options = $state<Omit<RenderParameters, "sitekey" | "element">>({
		language: "en",
	});

	function onReady(handle: FriendlyCaptchaHandle) {
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
		theme = theme === "light" ? "dark" : "light";
		options.theme = theme;
	}
</script>

<div>
	<h3>Friendly Captcha Test</h3>
	<FriendlyCaptcha bind:this={captchaRef} sitekey="FCMGEMUD5P6765JJ" {options} onready={onReady} onerror={onError} onsolve={onSolve} />
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
