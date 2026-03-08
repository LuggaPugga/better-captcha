<script lang="ts">
	import type { TSecHandle } from "@better-captcha/svelte/provider/t-sec";
	import TSec from "@better-captcha/svelte/provider/t-sec";
	import { writable } from "svelte/store";

	let captchaRef: TSec | undefined;
	const response = writable<string | false>(false);
	const error = writable<Error | null>(null);
	const solved = writable<boolean>(false);

	function onReady(handle: TSecHandle) {
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
		response.set(false);
	}

	async function handleExecute() {
		await captchaRef?.execute();
	}

	async function handleRender() {
		await captchaRef?.render();
	}

	function handleGetResponse() {
		const captchaResponse = captchaRef?.getResponse() ?? false;
		response.set(captchaResponse);
	}
</script>

<div>
	<h3>T-Sec Test</h3>
	<TSec bind:this={captchaRef} sitekey="189905409" options={{ userLanguage: "en" }} onready={onReady} onerror={onError} onSolve={onSolve} />
	{#if $solved}
		<p id="captcha-solved">Captcha Solved!</p>
	{/if}
	<div style="margin-top: 10px">
		<button type="button" onclick={handleDestroy}>Destroy</button>
		<button type="button" onclick={handleReset}>Reset</button>
		<button type="button" onclick={handleExecute}>Execute</button>
		<button type="button" onclick={handleRender}>Render</button>
		<button type="button" onclick={handleGetResponse}>Get Response</button>
	</div>
	{#if $response}
		<p id="captcha-response">{JSON.stringify($response, null, "\t")}</p>
	{/if}
	{#if $error}
		<p style="color: red">Error: {$error.message}</p>
	{/if}
</div>
