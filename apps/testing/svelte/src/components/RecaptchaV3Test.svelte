<script lang="ts">
	import type { ReCaptchaV3Handle, RenderParameters } from "@better-captcha/svelte/provider/recaptcha-v3";
	import ReCaptchaV3 from "@better-captcha/svelte/provider/recaptcha-v3";

	let captchaRef: ReCaptchaV3 | undefined;
	let response = $state<string | null>(null);
	let error = $state<Error | null>(null);
	let solved = $state<boolean>(false);

	let options = $state<RenderParameters>({
		action: "submit",
	});

	function onReady(handle: ReCaptchaV3Handle) {
		console.log("Captcha ready!", handle);
	}

	function onError(err: Error) {
		error = err;
		console.error("Captcha error:", err);
	}

	function onSolve(token: string) {
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
		response = captchaResponse;
	}

	function handleChangeAction() {
		const actions = ["submit", "login", "register"];
		const currentIndex = actions.indexOf(options.action);
		const nextIndex = (currentIndex + 1) % actions.length;
		options = { action: actions[nextIndex] };
	}
</script>

<div>
	<h3>reCAPTCHA v3 Test</h3>
	<ReCaptchaV3
		bind:this={captchaRef}
		sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
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
		<button type="button" onclick={handleChangeAction}>Change Action</button>
	</div>
	{#if response}
		<p id="captcha-response">{response}</p>
	{/if}
	{#if error}
		<p style="color: red">Error: {error.message}</p>
	{/if}
</div>

