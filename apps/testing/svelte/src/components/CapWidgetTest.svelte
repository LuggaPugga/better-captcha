<script lang="ts">
	import type { RenderParameters, CapWidgetHandle } from "@better-captcha/svelte/provider/cap-widget";
	import CapWidget from "@better-captcha/svelte/provider/cap-widget";
	import { writable } from "svelte/store";

	let captchaRef: CapWidget | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);
	const solved = writable<boolean>(false);

	let options = $state<RenderParameters>({});

	function onReady(handle: CapWidgetHandle) {
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
</script>

<div>
	<h3>CapWidget Test</h3>
	<CapWidget bind:this={captchaRef} endpoint="https://captcha.gurl.eu.org/api/" {options} onready={onReady} onerror={onError} onSolve={onSolve} />
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
		<p id="captcha-response">{$response}</p>
	{/if}
	{#if $error}
		<p style="color: red">Error: {$error.message}</p>
	{/if}
</div>

