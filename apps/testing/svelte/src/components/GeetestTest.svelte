<script lang="ts">
	import type { GeetestHandle, GeetestSolveResponse, RenderParameters } from "@better-captcha/svelte/provider/geetest";
	import Geetest from "@better-captcha/svelte/provider/geetest";

	let captchaRef: Geetest | undefined;
	let response = $state<string | null>(null);
	let error = $state<Error | null>(null);
	let solved = $state<boolean>(false);

	let options = $state<RenderParameters>({
    language: 'eng',
	});

	function onReady(handle: GeetestHandle) {
		console.log("Captcha ready!", handle);
	}

	function onError(err: Error) {
		error = err;
		console.error("Captcha error:", err);
	}

	function onSolve(token: GeetestSolveResponse) {
		solved = true;
		console.log("Captcha solved with token:", token);
	}

	function handleDestroy() {
		captchaRef?.destroy();
	}

	function handleReset() {
		captchaRef?.reset();
		response = null;
	}

	async function handleExecute() {
		await captchaRef?.execute();
	}

	async function handleRender() {
		await captchaRef?.render();
	}

	function handleGetResponse() {
		const captchaResponse = captchaRef?.getResponse() || "No response";
		response = JSON.stringify(captchaResponse, null, '\t');
	}
</script>

<div>
	<h3>Geetest Test</h3>
	<Geetest
		bind:this={captchaRef}
		sitekey="647f5ed2ed8acb4be36784e01556bb71"
		{options}
		onready={onReady}
		onerror={onError}
		onSolve={onSolve}
	/>
	{#if solved}
		<p id="captcha-solved">Captcha Solved!</p>
	{/if}
	<div style="margin-top: 10px">
		<button type="button" onclick={handleDestroy}>Destroy</button>
		<button type="button" onclick={handleReset}>Reset</button>
		<button type="button" onclick={handleExecute}>Execute</button>
		<button type="button" onclick={handleRender}>Render</button>
		<button type="button" onclick={handleGetResponse}>Get Response</button>
	</div>
	{#if response}
		<p id="captcha-response">{response}</p>
	{/if}
	{#if error}
		<p style="color: red">Error: {error.message}</p>
	{/if}
</div>
