# better-captcha

Framework-agnostic wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

Install the package and peer dependencies that match your project setup:

### React
```sh
bun install @better-captcha/react
```
```sh
npm install @better-captcha/react
```

### Qwik
```sh
bun install @better-captcha/qwik
```
```sh
npm install @better-captcha/qwik
```

### SolidJS
```sh
bun install @better-captcha/solidjs
```
```sh
npm install @better-captcha/solidjs
```

### Vue
```sh
bun install @better-captcha/vue
```
```sh
npm install @better-captcha/vue
```

## Basic usage

```tsx
import { ReCaptcha } from "@better-captcha/react/provider/recaptcha";

export function ContactCaptcha() {
	return <ReCaptcha sitekey="your-site-key" />;
}
```

```tsx
import { component$ } from "@builder.io/qwik";
import { ReCaptcha } from "@better-captcha/qwik/provider/recaptcha";

export const ContactCaptcha = component$(() => {
	return <ReCaptcha sitekey="your-site-key" />;
});
```

```vue
<template>
	<ReCaptcha sitekey="your-site-key" />
</template>

<script setup lang="ts">
	import { ReCaptcha } from "@better-captcha/vue/provider/recaptcha";
</script>
```

Keep the component inside a client-only boundary, access the ref to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified hook-driven lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
