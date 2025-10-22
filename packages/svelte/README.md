# @better-captcha/svelte

Svelte wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

```sh
bun install @better-captcha/svelte
```
```sh
npm install @better-captcha/svelte
```

## Basic usage

```svelte
<script lang="ts">
import ReCaptcha from "@better-captcha/svelte/provider/recaptcha";
import type { ReCaptchaHandle } from "@better-captcha/svelte/provider/recaptcha";

let captchaRef: ReCaptcha | undefined;

function onReady(handle: ReCaptchaHandle) {
  console.log("Captcha is ready", handle);
}

function onError(error: Error) {
  console.error("Captcha error:", error);
}
</script>

<ReCaptcha
  bind:this={captchaRef}
  sitekey="your-site-key"
  options={{ theme: 'light' }}
  onready={onReady}
  onerror={onError}
/>
```

Keep the component inside a client-only boundary, access the ref to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified hook-driven lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
