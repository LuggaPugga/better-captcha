<script lang="ts">
	import FriendlyCaptcha from "@better-captcha/svelte/provider/friendly-captcha";
	import type { FriendlyCaptchaHandle, RenderParameters } from "@better-captcha/svelte/provider/friendly-captcha";
	import { writable } from "svelte/store";

	let captchaRef: FriendlyCaptcha | undefined;
	const response = writable<string | null>(null);
	const error = writable<Error | null>(null);

	let options = $state<Omit<RenderParameters, "sitekey" | "element">>({
		language: "en",
	});

	function onReady(handle: FriendlyCaptchaHandle) {
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
</script>

<div>
	<h3>Friendly Captcha Test</h3>
	<FriendlyCaptcha bind:this={captchaRef} sitekey="FCMGEMUD5P6765JJ" {options} onready={onReady} onerror={onError} />
	<div style="margin-top: 10px">
		<button type="button" onclick={handleDestroy}>Destroy</button>
		<button type="button" onclick={handleReset}>Reset</button>
		<button type="button" onclick={handleExecute}>Execute</button>
		<button type="button" onclick={handleGetResponse}>Get Response</button>
	</div>
	{#if $response}
		<p id="captcha-response">{$response}</p>
	{/if}
	{#if $error}
		<p style="color: red">Error: {$error.message}</p>
	{/if}
</div>
